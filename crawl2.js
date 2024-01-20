// axios - 특정 웹 사이트 페이지 내용물 가져오기.
// cheerio - HTML 구조를 가지고 있는 일반 텍스트를, 자바 스크립트에서 
// document 객체의 내장 함수를 사용해서 html 요소에 접근 하는 것 과 유사한 함수를 제공

const axios = require('axios')
const cheerio = require('cheerio')

const getHTML = async (keyword) => {
    try {
        const html = (await axios.get(`https://www.inflearn.com/courses?s=%${encodeURI(keyword)}`)).data
        return html
    } catch(e) {
        console.log(e)
    }
}

const parsing = async (page) => {
    const $ = cheerio.load(page);
    const courses = [];
    const $courseList = $(".course_card_item")

    $courseList.each()
}

const getCourse = async (keyword) => {
    const html = await getHTML(keyword)
    const courses = await parsing(html)
    console.log(courses)
}

getCourse("자바스크립트")