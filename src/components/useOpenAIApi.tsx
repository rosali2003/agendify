import axios from "axios";
import express from 'express';
import dotenv from 'dotenv';
// import { Configuration, OpenAIApi } from 'openai';
const OpenAI = require('openai');

const router = express.Router();
dotenv.config();

export const useOpenAIApi = () => {

  const autoComplete = () => {
    // const configuration = new Configuration({
    //   apiKey: process.env.OPEN_AI_KEY,
    // });
    // const openai = new OpenAIApi(configuration);
    const openai = new OpenAI(process.env.OPEN_AI_KEY);
    
    router.post("/find-complexity", async (req, res) => {
      try {
        const { prompt } = req.body;
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `
                  ${prompt}
          
                  The time complexity of this function is
                  ###
                `,
          max_tokens: 64,
          temperature: 0,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          stop: ["\n"],
        });
    
        return res.status(200).json({
          success: true,
          data: response.data.choices[0].text,
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: error.response
            ? error.response.data
            : "There was an issue on the server",
        });
      }
    });


  }
  
    // router.post('/generate', async (req, res, next) => {
    //     const prompt = req.body.prompt;
    //     try {
    //       const response = await axios.post(
    //         'https://api.openai.com/v1/engines/davinci-codex/completions',
    //         {
    //           prompt: prompt,
    //           max_tokens: 100,
    //         },
    //         {
    //           headers: {
    //             'Authorization': `Bearer YOUR_OPEN_AI_KEY`,
    //             'Content-Type': 'application/json'
    //           }
    //         }
    //       );
    //       res.send(response.data);
    //     } catch (error) {
    //       next(error);
    //     }
    //   });
      
    //   module.exports = router;

    return { autoComplete };
}

