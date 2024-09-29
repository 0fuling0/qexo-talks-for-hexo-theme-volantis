var qexo_talks = [];
var talk_page = 1;

document.addEventListener("DOMContentLoaded", function() {
  VolantisFancyBox.init(false, () => {
  });
});

function qexoFormatTime(format = "YYYY-mm-dd HH:MM:SS", num = Date.now()) {
  const date = num.toString().length === 10 ? new Date(num * 1000) : new Date(num);
  const opt = {
    "Y": date.getFullYear(),
    "m": String(date.getMonth() + 1).padStart(2, "0"),
    "d": String(date.getDate()).padStart(2, "0"),
    "H": String(date.getHours()).padStart(2, "0"),
    "M": String(date.getMinutes()).padStart(2, "0"),
    "S": String(date.getSeconds()).padStart(2, "0")
  };
  
  return format.replace(/(Y+|m+|d+|H+|M+|S+)/g, match => opt[match[0]]);
}

function likeQexoTalk(id, url, domid, limit) {
  const uri = `${url}/pub/like_talk/`;
  const talk = qexo_talks.find(t => t.id === id);
  
  const messageConfig = talk && !talk.liked
    ? { text: '点赞中', icon: 'fa-solid fa-champagne-glasses', bgColor: '#ccffcc', titleColor: '#44aa44', msgColor: '#006600' }
    : { text: '取消点赞?', icon: 'fas fa-heart-broken', bgColor: '#ffcccc', titleColor: '#ff4444', msgColor: '#990000' };

  const titleText = talk && !talk.liked ? '让点赞飞一会~' : '(╬ Ò﹏Ó)';

  VolantisApp.message(messageConfig.text, titleText, {
    icon: messageConfig.icon,
    position: 'topRight',
    backgroundColor: messageConfig.bgColor,
    titleColor: messageConfig.titleColor,
    messageColor: messageConfig.msgColor
  });

  const ajax = new XMLHttpRequest();
  ajax.open("POST", uri, true);
  ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4) {
      if (ajax.status === 200) {
        const res = JSON.parse(ajax.response);
        if (res.status) {
          const action = res.action ? '点赞' : '取消点赞';
          const successMsg = res.action ? '点赞已完成！' : '取消成功！';
          updateTalkLikeStatus(id, res.action);
          VolantisApp.message(`${action}成功`, successMsg, {
            icon: res.action ? 'fa-solid fa-champagne-glasses' : 'fas fa-heart-broken',
            position: 'topRight',
            backgroundColor: res.action ? '#ccffcc' : '#ffcccc',
            titleColor: res.action ? '#44aa44' : '#ff4444',
            messageColor: res.action ? '#006600' : '#990000'
          });
          updateQexoTalks(url, domid, limit);
        }
      } else {
        console.log("点赞失败! 网络错误");
      }
    }
  };

  ajax.send(`id=${id}`);
}


function updateTalkLikeStatus(id, liked) {
  qexo_talks.forEach(talk => {
    if (talk.id === id) {
      talk.like += liked ? 1 : -1;
      talk.liked = liked;
    }
  });
}

function generateQexoTalkItem(id, content, time, tags, like, liked, url, domid, limit) {
  // 处理标签，生成带图标和文字的标签 HTML
  const tagText = tags 
    ? tags.split(',').map(tag => createTagElement(tag.trim())).join('') 
    : "";

  // 使用 id 动态生成唯一的 data-group 和 data-fancybox 值
  const uniqueGroup = `talk${id}`;

  // 正则表达式匹配所有 <img> 标签
  const imgRegex = /<img([^>]+src=["']([^"']+)["'][^>]*)>/g;

  // 替换 <img> 标签并将所有图片放入一个 <div>
  const imagesHtml = [];
  const updatedContent = content.replace(imgRegex, (match, attributes, src) => {
    const altText = (attributes.match(/alt=["']([^"']*)["']/) || [])[1];

    // 生成单个图片的 HTML，使用 uniqueGroup 替代 "one"
    const imageHtml = `
      <div class="fancybox">
        <a class="fancybox" itemscope itemtype="http://schema.org/ImageObject" itemprop="url" target="_blank" 
           rel="external nofollow noopener noreferrer" href="${src}" data-fancybox="${uniqueGroup}" data-caption="${altText}">
          <img fancybox itemprop="contentUrl" alt="${altText || 'image'}" src="${src}" class="responsive-image">
        </a>
        <span class="image-caption">${altText || ''}</span>
      </div>
      <br>`; // 在每个 fancybox 之后添加 <br>
    
    // 将图片 HTML 添加到数组
    imagesHtml.push(imageHtml);
    return ''; // 替换原图为 ''，因为我们会在最后插入
  });

  // 仅在有图片的情况下生成 imagesContainer
  const imagesContainer = imagesHtml.length > 0 
    ? `
        <div galleryflag itemscope itemtype="http://schema.org/ImageGallery" class="gallery" data-group="${uniqueGroup}">
          ${imagesHtml.join('')}
        </div>` 
    : ''; // 如果没有图片则返回空字符串

  const likeHtml = liked 
    ? `<a class="qexot-like" onclick="likeQexoTalk('${id}', '${url}', '${domid}', '${limit}')">
        <i class="fas fa-heart" style="color: red; margin-right: 0.25rem;"></i> ${like}
      </a>`
    : `<a class="qexot-like" onclick="likeQexoTalk('${id}', '${url}', '${domid}', '${limit}')">
        <i class="far fa-heart"></i> ${like}
      </a>`;

  return `
    <div class="qexot-item">
      <div class="qexot-top">
        <span class="qexot-tags">${tagText}</span>
      </div>
      <div class="qexot-content">
        <div class="datacont">${updatedContent}${imagesContainer}</div> <!-- 仅当有图片时才插入 imagesContainer -->
      </div>
      <div class="qexot-bottom">
        <div class="qexot-info">
          <time class="qexot-datatime" datetime="${time}">${time}</time>
        </div>
        ${likeHtml}
      </div>
    </div>`;
}

// 创建标签元素
function createTagElement(tag) {
  const tagElement = document.createElement("span");
  tagElement.className = "tag";

  // 创建 Font Awesome 图标
  const iconElement = document.createElement("i");
  iconElement.className = "fa-solid fa-hashtag fa-fw";

  // 添加图标和标签文字
  tagElement.appendChild(iconElement);
  tagElement.append(`${tag}`);

  return tagElement.outerHTML; // 返回 HTML 字符串
}






function showQexoTalks(id, url, limit = 5, more = false) {
  if (!more) {
    qexo_talks = [];
    talk_page = 1;
  }

  if (more) {
    document.getElementById("qexot-more").innerHTML = "";
  } else {
    document.getElementById(id).innerHTML = `
      <div class="qexo_loading">
        <div class="qexo_part">
          <div style="display: flex; justify-content: center">
            <div class="qexo_loader">
              <div class="qexo_inner one"></div>
              <div class="qexo_inner two"></div>
              <div class="qexo_inner three"></div>
            </div>
          </div>
        </div>
        <p style="text-align: center; display: block">说说加载中...</p>
      </div>`;
  }

  const uri = `${url}/pub/talks/?page=${talk_page}&limit=${limit}`;
  const ajax = new XMLHttpRequest();

  ajax.open("GET", uri, true);
  ajax.setRequestHeader("Content-Type", "text/plain");

  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4 && ajax.status === 200) {
      const res = JSON.parse(ajax.response);
      if (res.status) {
        // 使用 Set 来去重
        const newTalks = res.data.filter(talk => !qexo_talks.some(existingTalk => existingTalk.id === talk.id));

        // 只有新说说才加入 qexo_talks
        qexo_talks = qexo_talks.concat(newTalks);

        const countInfoHtml = `<div class="qexot-count-info">已加载「 ${qexo_talks.length} / ${res.count} 」条</div>`;
        let html = countInfoHtml + '<section class="qexot"><div class="qexot-list">';

        qexo_talks.forEach(talk => {
          html += generateQexoTalkItem(
            talk.id, 
            talk.content, 
            qexoFormatTime("YYYY-mm-dd", Number(talk.time)), 
            talk.tags.join(", "), 
            talk.like, 
            talk.liked, 
            url, 
            id, 
            limit
          );
        });

        html += '</div></section>';

        if (res.count > qexo_talks.length) {
          html += `<center id="qexot-more"><div class="qexot-more" onclick="showQexoTalks('${id}', '${url}', ${limit}, true)">加载更多</div></center>`;
        }

        document.getElementById(id).innerHTML = html;
        talk_page++;
      } else {
        console.log(res.data.msg);
      }
    } else if (ajax.readyState === 4) {
      console.log("说说获取失败! 网络错误");
    }
  };

  ajax.send(null);
}

function updateQexoTalks(url, domid, limit) {
  let html = '<section class="qexot"><div class="qexot-list">';
  qexo_talks.forEach(talk => {
    html += generateQexoTalkItem(
      talk.id, 
      talk.content, 
      qexoFormatTime("YYYY-mm-dd", Number(talk.time)), 
      talk.tags.join(", "), 
      talk.like, 
      talk.liked, 
      url, 
      domid, 
      limit
    );
  });
  html += '</div></section>';

  if (document.getElementById("qexot-more")) {
    html += '<center id="qexot-more"><div class="qexot-more" onclick="showQexoTalks(\'' + domid + '\',\'' + url + '\',\'' + limit + '\',true)">加载更多</div></center>';
  }

  document.getElementById(domid).innerHTML = html;
}




