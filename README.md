# XML Product Catalog System

A full-stack product catalog application that uses XML as the primary data source for storing and managing product information. The system supports schema validation, structured search, and browser-friendly rendering through XSLT.

Built collaboratively as an academic project and maintained as a portfolio-ready standalone version.

---

## Features

- Store product data using XML
- Validate catalog structure using DTD and XSD
- Search/filter products by category, price, and stock
- Query XML data using XPath
- Render product listings using XSLT
- Node.js + Express backend integration
- Product card based frontend UI

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- XSLT

### Backend
- Node.js
- Express.js

### Data / Markup
- XML
- DTD
- XSD
- XPath

---

## Project Structure

xml-product-catalog-system/  
├── products.xml  
├── products.dtd  
├── products.xsd  
├── presentation.html  
├── server.js  
├── package.json  
└── public/

---

## How It Works

1. Product data stored in XML  
2. DTD/XSD validate data structure  
3. Backend reads XML files  
4. XPath extracts requested data  
5. XSLT transforms XML into HTML views  
6. Frontend displays products in cards

---

## My Contributions

- Added product catalog entries to XML dataset  
- Implemented / improved DTD schema rules  
- Implemented / improved XSD validation rules  
- Added frontend product cards  
- Assisted with project presentation and refinement

---

## Run Locally

```bash
npm install
node server.js