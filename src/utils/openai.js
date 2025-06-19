const OpenAI = require('openai')
const projectModel = require('../models/projectModels')
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
    const [platforms] = await projectModel.getAllPlatform()
    const [productTypes] = await projectModel.getAllProductType()
    const [roles] = await projectModel.getAllRole()
    const [languages] = await projectModel.getAllLanguage()
    const [tools] = await projectModel.getAllTools()
    const [features] = await projectModel.getAllFeatures()

    //Set list as text for prompting
    const platformList = platforms.map(p => p.platform_name).join(', ')
    const productTypeList = productTypes.map(p => p.product_type_name).join(', ')
    const roleList = roles.map(r => r.role_name).join(', ')
    const languageList = languages.map(l => l.language_name).join(', ')
    const toolsList = tools.map(t => t.tools_name).join(', ')
    const featureList = features.map(r => r.feature_name).join(', ')

    const prompt =  `
                  Berdasarkan deskripsi project berikut:
                  """
                  ${project_desc}
                  """

                  Analisis dan hasilkan output JSON dengan format berikut:

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

                  Ketentuan pilihan:
                  - Platforms: ${platformList}
                  - Product Types: ${productTypeList}
                  - Languages: ${languageList}
                  - Tools: ${toolsList}
                  - Roles: ${roleList} (Wajib ada Project Manager max. 1 orang)
                  - Features: ${featureList}

                  Tugas:
                  1. Tentukan pilihan yang paling sesuai atau tambahkan baru jika tidak tersedia.
                  2. Tulis ulang deskripsi agar lebih profesional.
                  3. Susun minimal 3 fase timeline dari antara ${start_date} s/d ${end_date}.

                  Output hanya dalam JSON sesuai format di atas.
                `

          let modelsToTry = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
          let lastError = null

          for (let model of modelsToTry) {
            try {
              console.log(`Trying model: ${model}`)
              const completion = await callChatCompletion(model, prompt)
              const content = completion.choices[0].message.content
              const parsed = JSON.parse(content)
              return parsed
            } catch (error) {
              console.error(`Error with model ${model}:`, error.message);
              lastError = err
              if (error.status === 429 || error.message.includes('quota')) {
                // Fallback to another model
                continue
              } else {
                // If ain't quota error, just stop
                throw err
              }
            }
          }
          throw lastError

  } catch (error) {
    console.error('Error in generateProjectAnalysis:', error.message)
    return null
  }
}

module.exports = { 
  openai,
  generateProjectAnalysis 
}
