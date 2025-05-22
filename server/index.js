import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* 生成第一次 / 第二次引导句 */
app.post('/chat', async (req, res) => {
  const { pageId, stage, prevAsk='' } = req.body;          // stage: first / second
  const sys = `你是儿童绘本助手 Lulu，句子≤15字，用中文。若 stage 是 second 必须换新句式。`;
  const user = `stage=${stage}; page=${pageId}; prevAsk="${prevAsk}"`;
  const rsp  = await openai.chat.completions.create({
    model:'gpt-3.5-turbo',temperature:0.4,
    messages:[{role:'system',content:sys},{role:'user',content:user}]
  });
  res.json({ ask: rsp.choices[0].message.content.trim() });
});

/* 判断答案正确性 + 给鼓励语 */
app.post('/judge', async (req,res)=>{
  const { expect, answer } = req.body;
  const j = await openai.chat.completions.create({
    model:'gpt-3.5-turbo',temperature:0,
    messages:[
      {role:'system',content:'回答 yes/partial/no'},
      {role:'user',content:`正确关键词:${expect}\n儿童回答:${answer}`}
    ]
  });
  const result = j.choices[0].message.content.trim();
  const praise = ['太棒了！','做得真好！','继续加油！'][Math.floor(Math.random()*3)];
  res.json({ result, praise });
});

app.listen(3001, ()=>console.log('Lulu API on 3001'));
