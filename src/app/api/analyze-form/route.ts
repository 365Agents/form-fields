import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import yaml from 'js-yaml'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface FormField {
  id: string
  text: string
  type: string
  required: boolean
  options?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const mimeType = image.type

    // Analyze image with OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this form image and extract all form fields. For each field, identify:
              1. The label/text displayed to users
              2. The field type (string, email, number, select, textarea, etc.)
              3. Whether it appears to be required (look for asterisks, "required" text, etc.)
              4. For select/dropdown fields, list the options if visible
              
              Return a JSON object with this structure:
              {
                "title": "form title if visible",
                "fields": [
                  {
                    "label": "Field Label",
                    "type": "string|email|number|select|textarea",
                    "required": true|false,
                    "options": ["option1", "option2"] // only for select fields
                  }
                ]
              }
              
              Be accurate and only extract what you can clearly see in the image.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let extractedData
    try {
      extractedData = JSON.parse(content)
    } catch {
      throw new Error('Invalid JSON response from OpenAI')
    }

    // Convert to our YAML structure
    const formFields: FormField[] = extractedData.fields.map((field: any, index: number) => ({
      id: field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      text: field.label,
      type: field.type,
      required: field.required,
      options: field.options || []
    }))

    // Generate YAML structure
    const yamlStructure = {
      questionnaire: {
        id: 'uploaded_form',
        text: extractedData.title || 'Form',
        type: 'group',
        questions: formFields.map(field => ({
          id: field.id,
          text: field.text,
          type: field.type,
          required: field.required,
          options: field.options
        }))
      }
    }

    const yamlString = yaml.dump(yamlStructure, {
      indent: 2,
      lineWidth: -1
    })

    return NextResponse.json({
      yaml: yamlString,
      extractedFields: formFields
    })

  } catch (error) {
    console.error('Error analyzing form:', error)
    return NextResponse.json(
      { error: 'Failed to analyze form image' },
      { status: 500 }
    )
  }
}