# AI Document Generation Feature

## Overview
The AI Document Generation feature allows users to create PDF documents, PowerPoint presentations, and Excel spreadsheets using AI (Mistral API) directly from the search interface. Generated documents automatically open in OnlyOffice editors for immediate editing within the OS.

## How to Use

### 1. Access the Feature
- Click the AI Search button (Bot icon) in the bottom-right corner of the desktop
- The search popup will open with AI generation options below the search bar

### 2. Enter Your Prompt
- Type a description of what you want to generate in the search box
- Examples:
  - "Create a business plan for a coffee shop"
  - "Make a presentation about renewable energy"
  - "Generate a budget spreadsheet for a startup"
  - "Write a technical report on machine learning"

### 3. Choose Document Type
Click one of the three generation buttons:
- **PDF Document**: Creates structured documents with sections and content
- **Presentation**: Creates slides with titles, content, and speaker notes
- **Spreadsheet**: Creates tabular data with headers, rows, and formulas

### 4. AI Generation Process
- The AI will process your prompt using Mistral API
- A loading indicator shows the generation progress
- Generated content is automatically formatted for the chosen document type

### 5. Automatic Editor Opening
- Once generated, the document opens automatically in the appropriate OnlyOffice editor:
  - PDF → OnlyOffice Writer
  - Presentation → OnlyOffice Impress
  - Spreadsheet → OnlyOffice Calc
- You can immediately start editing the generated content
- Documents are saved locally and can be accessed later

## Features

### Smart Content Generation
- **PDF Documents**: Creates structured content with sections, headings, and paragraphs
- **Presentations**: Generates slides with titles, bullet points, and speaker notes
- **Spreadsheets**: Creates tabular data with appropriate headers and formulas

### Seamless Integration
- No downloads required - documents open directly in the OS
- Full editing capabilities through OnlyOffice suite
- Local storage for document persistence
- Recent documents accessible through editor sidebars

### User Experience
- Real-time loading indicators
- Success notifications
- Error handling with helpful messages
- Responsive design for all screen sizes

## Technical Details

### API Configuration
- Uses Mistral AI API for content generation
- API key configured in `.env` file as `VITE_MISTRAL_API_KEY`
- Supports different Mistral models for various content types

### Document Formats
- PDF documents saved as `.docx` files in OnlyOffice Writer
- Presentations saved as `.pptx` files in OnlyOffice Impress  
- Spreadsheets saved as `.xlsx` files in OnlyOffice Calc

### Storage
- Documents stored locally using browser localStorage
- Metadata includes creation date, type, and AI generation flag
- Original AI-generated content preserved for reference

## Tips for Best Results

### Effective Prompts
- Be specific about the content you want
- Include context and target audience
- Mention desired length or number of sections/slides
- Specify any particular format requirements

### Examples of Good Prompts
- "Create a 5-slide presentation about sustainable energy solutions for businesses"
- "Generate a comprehensive business plan for a mobile app startup including market analysis and financial projections"
- "Make a budget spreadsheet for a small restaurant with monthly expenses and revenue tracking"

### Troubleshooting
- Ensure Mistral API key is properly configured
- Check internet connection for API access
- Try shorter, more specific prompts if generation fails
- Use the "Try Again" button for temporary API issues

## Future Enhancements
- Support for additional document templates
- Integration with cloud storage services
- Collaborative editing features
- Advanced formatting options
- Multi-language support