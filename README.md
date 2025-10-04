# Gemini AI Conversation Script v2.1



This is a Node.js script that allows two Google Gemini AI models to hold a conversation with each other. It includes several modes for different types of interaction, such as observing, participating in a three-way chat, or having the AIs cooperatively analyze a user-provided file.



++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



## ✨ Features


* **Observer Mode:** 

Let two AIs talk to each other without interruption.


* **Chat Room Mode:** 

A three-way chat between you and two different AI models.


* **Cooperative Exploration Mode:** 

Upload a file (text, image, etc.) and have the AIs discuss and analyze it together.


* **Configurable:** 

Easily change the models, turn limits, and delay between responses.


* **Saves History:** 

Automatically saves conversation transcripts to a `convos` directory.



++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



## 🚀 How to Use



1.  **Prerequisites:** 

You need to have [Node.js](https://nodejs.org/) installed on your system.


2.  **Clone the repository:** 

`git clone <your-repo-url-here>`


3.  **Navigate to the folder:** 

`cd gemini-ai-conversation-v2.1`


4.  **Install dependencies:** 

`npm install`


5.  **Create an environment file:** 

Create a file named `.env` in the main folder.


6.  **Add your API key:** 

Inside the `.env` file, add your Gemini API key like this:

GEMINI_API_KEY=YOURAPIKEY`


7.  **Run the script:** 

`npm start`



## ⚠️ Disclaimer


This script requires a valid Google Gemini API key.


WILL incur an API cost proportional to use.

API rates are relatively minor for personal, small scale use. 

You can check rates and access other info about working with API's, specifically Gemini, at:

https://ai.google.dev/gemini-api/docs/pricing?utm_source=PMAX&utm_medium=display&utm_campaign=FY25-global-DR-pmax-1710442&utm_content=pmax&gclsrc=aw.ds&gad_source=1&gad_campaignid=21521909442&gbraid=0AAAAACn9t64UZlTA8v9OYjgg1TRgOl7xr&gclid=CjwKCAjw6P3GBhBVEiwAJPjmLtNWsjzKB839dV6ej6fpqqtO_e-El4mlRGwZwyGDIb9dVIFsJQmknBoCFoMQAvD_BwE#gemini-2.5-pro



Your API key is your secret and should never be shared publicly.