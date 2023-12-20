const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');
const moment = require('moment');

// استدعاء الصفحة والحصول على محتواها
const url = 'https://sports.kora-star-tv.live/p/tomorrow-matches.html'; // استبدل برابط الصفحة الفعلية
request(url, (error, response, html_content) => {
  if (!error && response.statusCode === 200) {
    const $ = cheerio.load(html_content);

    // استخراج العناصر المطابقة
    const match_containers = $('.match-container');

    // إنشاء محتوى HTML لعرض المعلومات
    let html_output = `
    <html>
    <head>
    <style>
    .match-event {
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 10px;
    }
    .team-name {
      font-weight: bold;
    }
    .team-logo img {
      width: 70px;
      height: 70px;
    }
    </style>
    </head>
    <body>
    `;

    // إنشاء متغير لتخزين التاريخ والوقت الحاليين
    const now = moment();

    // تجميع محتوى الصفحة
    let match_events = '';
    match_containers.each((index, match_container) => {
      const link = $(match_container).find('a').attr('href');
      const team_names = $(match_container).find('.team-name');
      const match_info = $(match_container).find('.match-info');

      const home_team = $(team_names[0]).text();
      const away_team = $(team_names[1]).text();

      // استخراج روابط شعارات الفرق
      const home_team_logo = $(match_container).find('.team-logo img').attr('data-img');
      const away_team_logo = $(match_container).find('.team-logo img').eq(1).attr('data-img');

      const match_time_element = $(match_container).find('.match-timing');
      let match_time, result_now;
      if (match_time_element.length > 0) {
        match_time = $(match_time_element).find('.date').text().trim();
        result_now = $(match_time_element).find('#result').text().trim();
      } else {
        match_time = 'No match time available';
        result_now = 'No result available';
      }

      const start_time = $(match_container).find('.date').attr('data-start');
      const end_time = $(match_container).find('.date').attr('data-gameends');

      let match_info_html = '';
      $(match_info).find('li').each((index, item) => {
        match_info_html += `<li><span>${$(item).text()}</span></li>`;
      });

      let match_event_html = `
      <div class="match-event">
          <a href="${link}" title="${home_team} vs ${away_team}">
              <div id="overlay-match">
                  <div id="watch-match"></div>
              </div>
          </a>
          <div class="first-team">
              <div class="team-logo">
                  <img alt="${home_team}" height="70" src="${home_team_logo}" title="${home_team}" width="70" />
              </div>
              <div class="team-name">${home_team}</div>
          </div>
          <div class="match-time">
              <div class="match-timing">
                  <p>${match_time}<span id="time">${now.format('')}</span></p>
                  <div id="result-now">${result_now}</div>
                  <div id="match-hour"></div><span class="match-date" data-start="${start_time}" data-gameends="${end_time}"></span>
              </div>
          </div>
          <div class="left-team">
              <div class="team-logo">
                  <img alt="${away_team}" height="70" src="${away_team_logo}" title="${away_team}" width="70" />
              </div>
              <div class="team-name">${away_team}</div>
          </div>
          <div class="match-info">
             <ul>
               ${match_info_html}
              </ul>
          </div>
      </div>
      `;
      match_events += match_event_html;
    });

    // إضافة محتوى الصفحة إلى قالب HTML
    html_output += match_events;
    html_output += `
    </body>
    </html>
    `;

    // كتابة المحتوى إلى ملف output.html
    fs.writeFileSync('output.html', html_output, 'utf-8');
    console.log('تم إنشاء ملف output.html بنجاح.');
  }
});

