const OpenAI = require('openai')
const categoriesModel = require('../models/categoriesModels')
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Reusable function for call chat API
async function callChatCompletion(model, prompt) {
  return await openai.chat.completions.create({
    model: model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048
  });
}

const generateProjectAnalysis = async ({project_desc, start_date, end_date}) => {
  try {
    //Fetch Categories From Database
    const [platforms] = await categoriesModel.getAllPlatform()
    const [productTypes] = await categoriesModel.getAllProductType()
    const [roles] = await categoriesModel.getAllRole()
    const [languages] = await categoriesModel.getAllLanguage()
    const [tools] = await categoriesModel.getAllTools()
    const [features] = await categoriesModel.getAllFeature()

    //Set list as text for prompting
    const platformList = platforms.map(p => p.platform_name).join(', ')
    const productTypeList = productTypes.map(p => p.product_type_name).join(', ')
    const roleList = roles.map(r => r.role_name).join(', ')
    const languageList = languages.map(l => l.language_name).join(', ')
    const toolsList = tools.map(t => t.tools_name).join(', ')
    const featureList = features.map(r => r.feature_name).join(', ')

    const prompt =  `
                  Given the following project description:
                  ${project_desc}

                  Analyze and return a JSON with the following format:

                  {
                    "platforms": [],
                    "product_types": [],
                    "roles": [{"role_name": "", "amount": 1}],
                    "languages": [],
                    "tools": [],
                    "features": [],
                    "generated_desc": "",
                    "timeline": [
                      {"project_phase": "", "start_date": "YYYY/MM/DD", "end_date": "YYYY/MM/DD"}
                    ]
                  }

                  Available options:
                  - Platforms: ${platformList}
                  - Product Types: ${productTypeList}
                  - Languages: ${languageList}
                  - Tools: ${toolsList}
                  - Roles: ${roleList} (Must include 1 Project Manager)
                  - Features: ${featureList}

                  Instructions:
                  1. Select the most relevant items from the options above.
                  2. Rewrite the description to sound more professional and structured.
                  3. Create at least 3 project phases in the timeline between ${start_date} and ${end_date}.

                  Output ONLY the final JSON (no explanation, no extra text).
                `

          let modelsToTry = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
          let lastError = null

          for (let model of modelsToTry) {
            try {
              console.log(`Trying model: ${model}`)
              const completion = await callChatCompletion(model, prompt)
              let content = (completion.choices[0].message.content).trim()

              // Cleaner → remove backtick ` or block code
              if (content.startsWith("```json")) {
                  content = content.replace(/```json/, "").replace(/```/, "").trim()
              } else if (content.startsWith("```")) {
                  content = content.replace(/```/, "").replace(/```/, "").trim()
              }

              const parsed = JSON.parse(content)
              return parsed
            } catch (error) {
              console.error(`Error with model ${model}:`, error.message);
              lastError = error
              if (error.status === 429 || error.message.includes('quota')) {
                // Fallback to another model
                continue
              } else {
                // If ain't quota error, just stop
                throw error
              }
            }
          }
          throw lastError

  } catch (error) {
    console.error('Error in generateProjectAnalysis:', error.message)
    return null
  }
}

const filterProjectByRole = async (projectDetail, role_name) => {
  try {
    const prompt = `
    Given the following project categories and the target role "${role_name}", 
    select only values that are relevant or loosely related to this role. 
    If no category is clearly relevant, KEEP the original values unfiltered.

    Return ONLY in this exact JSON format:
    {
      "platform": [],
      "product": [],
      "language": [],
      "tools": []
    }

    Input:
    - Platforms: ${projectDetail.platforms}
    - Products: ${projectDetail.product_types}
    - Languages: ${projectDetail.languages}
    - Tools: ${projectDetail.tools}
    `.trim()

    let modelsToTry = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
    let lastError = null

    for (let model of modelsToTry) {
      try {
        console.log(`🔍 Trying model: ${model}`)
        const completion = await callChatCompletion(model, prompt)
        let content = completion.choices[0].message.content.trim()

        // Clean code block if exists
        if (content.startsWith("```json")) {
          content = content.replace(/```json/, "").replace(/```/, "").trim()
        } else if (content.startsWith("```")) {
          content = content.replace(/```/, "").replace(/```/, "").trim()
        }

        const parsed = JSON.parse(content)
        return parsed
      } catch (error) {
        console.error(`⚠️ Error with model ${model}:`, error.message)
        lastError = error
        if (error.status === 429 || error.message.includes('quota')) {
          continue
        } else {
          throw error
        }
      }
    }
    throw lastError

  } catch (error) {
    console.error('Error in filterProjectByRole:', error.message)
    return {
      platform: [],
      product: [],
      language: [],
      tools: []
    }
  }
}

module.exports = { 
  openai,
  generateProjectAnalysis,
  filterProjectByRole
}
