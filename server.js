import express from 'express';
import 'dotenv/config';
const app=express();
app.use(express.static('dist'));
app.post('/api/analyze',express.raw({type:['image/jpeg','image/png','image/webp','image/heic','image/heif'],limit:'8mb'}),async(req,res)=>{
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY орнатылмаған. Сервердегі .env файлын толтырыңыз.'});
 const mime=req.headers['content-type']?.split(';')[0];
 if(!['image/jpeg','image/png','image/webp'].includes(mime))return res.status(415).json({error:'JPG, PNG немесе WEBP суретін таңдаңыз.'});
 if(!Buffer.isBuffer(req.body)||!req.body.length)return res.status(400).json({error:'Сурет жіберілмеді.'});
 try{
 const instruction=`Сен қазақ көшпенділерінің материалдық мәдениетін зерттеуге көмектесетін сақ әрі білімді визуалды талдаушысың. Суреттегі киім, әшекей, ою, бас киім, тұрмыстық зат, жануарлық және геометриялық мотивтерді талда. Көрінбейтін белгілерді ойдан шығарма. Нақты этнографиялық сәйкестік күмәнді болса, анық айт. Жынысқа қатысты тарихи қолданысты қазіргі міндетті ереже ретінде көрсетпе. Тарихи дереккөз немесе сілтеме ойдан құрастырма. Барлық жауап қазақша. ТЕК JSON қайтар: {"name":"қысқа атау","description":"көрінетін элементтер","history":"тарихи контекст, дәлелденбесе ықтималдықты атап өт","meaning":"символдық мағынасы және вариациялары","usage":"тарихи қолданылуы","modern":"заманауи дизайнмен байланысы","confidence":"жоғары/орташа/төмен және себебі","caveat":"шектеулер, белгісіздіктер","search_terms":["іздеу термині"]}. Егер қазақ көшпенділерімен байланысы байқалмаса, соны ашық айт.`;
 const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',response_format:{type:'json_object'},temperature:0.2,messages:[{role:'system',content:instruction},{role:'user',content:[{type:'text',text:'Осы фотосуретті талдап, мәдени байланысын түсіндір.'},{type:'image_url',image_url:{url:`data:${mime};base64,${req.body.toString('base64')}`}}]}]})});
 const raw=await r.json();if(!r.ok)throw Error(raw.error?.message||'AI қызметі жауап бермеді');const content=raw.choices?.[0]?.message?.content;if(!content)throw Error('Бос жауап');res.json(JSON.parse(content));
 }catch(e){console.error(e);res.status(502).json({error:'Талдау орындалмады: '+e.message})}
});
const port=Number(process.env.PORT||3000);app.listen(port,()=>console.log(`NOMAD CODE AI: http://localhost:${port}`));
