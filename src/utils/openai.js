const OpenAI = require('openai')
const projectModel = require('../models/projectModels')
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const generateProjectAnalysis = async ({project_desc, start_date, end_date}) => {
  try {
    //Ambil kategori dari database
    const [platforms] = await projectModel.getAllPlatform()
    const [productTypes] = await projectModel.getAllProductType()
    const [roles] = await projectModel.getAllRole()
    const [languages] = await projectModel.getAllLanguage()
    const [tools] = await projectModel.getAllTools()
    const [features] = await projectModel.getAllFeatures()

    //Siapkan list sebagai teks untuk prompt
    const platformList = platforms.map(p => p.platform_name).join(', ')
    const productTypeList = productTypes.map(p => p.product_type_name).join(', ')
    const roleList = roles.map(r => r.role_name).join(', ')
    const languageList = languages.map(l => l.language_name).join(', ')
    const toolsList = tools.map(t => t.tools_name).join(', ')
    const featureList = features.map(r => r.feature_name).join(', ')

    const prompt = `
              Buatkan analisis berdasarkan deskripsi project berikut ini:
              """
              ${project_desc}
              """
              1. Tentukan platform target dari proyek ini (Pilihan: ${platformList} atau buat platform baru jika tidak ada pilihan).
              2. Tentukan product type dari proyek ini (Pilihan: ${productTypeList} atau buat product type baru jika tidak ada pilihan).
              3. Tentukan bahasa pemrograman yang cocok dengan proyek ini (Pilihan: ${languageList} atau buat bahasa pemrograman baru jika tidak ada pilihan).
              4. Tentukan tools utama yang akan digunakan di proyek ini. (Pilihan: ${toolsList} atau buat tools baru jika tidak ada pilihan).
              5. Tentukan role yang dibutuhkan (Pilihan: ${roleList} atau buat role baru jika tidak ada pilihan) berserta jumlah tiap rolenya. Setiap project wajib memiliki 1 Role Project Manager.
              6. Tentukan feature yang dibutuhkan proyek ini (Pilihan: ${featureList} atau buat feature baru jika tidak ada pilihan).
              7. Tulis ulang deskripsi project agar lebih profesional, jelas dan mudah dipahami.
              8. Buat estimasi pembagian fase project (timeline) berdasarkan start_date: ${start_date} dan end_date: ${end_date}. Setidaknya ada 3 fase.

              Format output JSON:
              {
              "platforms": ["..."],
              "product_types": ["..."],
              "roles": [
                  {"role_name": "Project Manager", "amount": 1},
                  {"role_name": "Frontend Developer", "amount": 2},
                  {"role_name": "Backend Developer", "amount": 2}
              ],
              "languages": ["..."],
              "tools": ["..."],
              "features": ["..."],
              "generated_desc": "...",
              "timeline": [
                  {"project_phase": "Planning", "start_date": "2025-06-01", "end_date": "2025-06-07"},
                  {"project_phase": "Development", "start_date": "2025-06-08", "end_date": "2025-07-15"},
                  {"project_phase": "Testing & Deployment", "start_date": "2025-07-16", "end_date": "2025-07-31"}
              ]
              }`

          const completion =  await openai.chat.completions.create({
                                  model: 'gpt-4o',
                                  messages: [{ role: 'user', content: prompt }],
                                  temperature: 0.7
                              })

          const parsed = JSON.parse(completion.data.choices[0].message.content)
          return parsed
  } catch (error) {
    console.error('Error in generateProjectAnalysis:', error.message)
    return null
  }
}

module.exports = { 
  openai,
  generateProjectAnalysis 
}
