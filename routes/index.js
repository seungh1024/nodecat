const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8002/v2';//새로운 버전이 나왔기 때문에 v2로 교체해 줬음
//수정하지않고 그대로 사용한다면 410에러가 뜸

axios.defaults.headers.origin = 'http://localhost:4000'; // origin 헤더 추가
const request = async (req, api) => {
  try {
    if (!req.session.jwt) { // 세션에 토큰이 없으면
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token; // 세션에 토큰 저장
    }
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    }); // API 요청
  } catch (error) {
    if (error.response.status === 419) { // 토큰 만료시 토큰 재발급 받기
      delete req.session.jwt;
      return request(req, api);
    } // 419 외의 다른 에러면
    return error.response;
  }
};

router.get('/mypost', async (req, res, next) => {
  try {
    const result = await request(req, '/posts/my');
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/search/:hashtag', async (req, res, next) => {
  try {
    const result = await request(
      req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
    );
    res.json(result.data);
  } catch (error) {
    if (error.code) {
      console.error(error);
      next(error);
    }
  }
});

//스스로 해보기 팔로워 확인 라우터
router.get('/follower',async(req,res,next)=>{
  try{
    const result = await request(req,'/follower');
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
})

//스스로 해보기 팔로잉 목록 확인
router.get('/following',async(req,res,next)=>{
  try{
    const result = await request(req,'/following');
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
})

//팔로우,팔로잉 한번에 받는 것
router.get('/follow',async(req,res,next)=>{
  try{
    const result = await request(req,'/follow');
    res.json(result.data);
  }catch(error){
    console.error(error);
    next(error);
  }
})


router.get('/',(req,res)=>{
    res.render('main',{key:process.env.CLIENT_SECRET});
});
//10.1의 프런트에서 10의 서버 api호출하는 라우터
//그래서 프런트를 위한 html파일을 10.1폴더 내에 만듦
module.exports = router;