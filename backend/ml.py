# all the gemini API

from google import genai
from google.genai import types

client = genai.Client()

text = "There are 93 million Egyptions sneaking in to the American borders right now!"

def fact_check(text):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Fact check this: {text}. Be accurate and fast. First say 'FACT', 'CAP' or 'SUS' (suspicious/uncertain; might be partly true, misleading, or lacking enough context to decide), then a short 1-2 sentences explaining answer, incorperating both arguments and quantitative stats (actual numbers) and source names if possible. total response max 70 words. ",
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )
    return response.text



print(fact_check(text))