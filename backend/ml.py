# all the gemini API

from google import genai
from google.genai import types
import json

client = genai.Client(api_key="AIzaSyDxhcY01l8P6m8lqxrHnU9YeH1BROBla3w")
def clean_json_string(s: str) -> str:
    """
    Removes ```json and ``` fences from a string, if present.
    """
    # Strip leading/trailing whitespace
    s = s.strip()
    
    # Remove opening fence
    if s.startswith("```json"):
        s = s[len("```json"):].lstrip()
    
    # Remove generic closing fence
    if s.endswith("```"):
        s = s[:-3].rstrip()
    
    return s


input_str = """
[
        {"Speaker": "Person A", "Text": "There are 93 million Egyptions sneaking in to the American borders right now!"},
        {"Speaker": "Person B", "Text": "Thats not true."}
    ]
"""

# @app.route("/fact-check", methods=["GET"])
#def fact_check_endpoint():
#    """Example endpoint to run fact-checking on a given text input."""#
#
#    text = request.args.get("text", "").strip()
#    if not text:
#        return jsonify({"error": "No text provided"}), 400

#    try:
#        result = fact_check(text)
#        return jsonify({"result": result})
#    except Exception as e:
#        return jsonify({"error": str(e)}), 500




def fact_check(textinput):
    prompt = f"""
        fact check this conversation: {textinput}. Be accurate and fast. 
        Respond in dictionary format with keys "speaker", "verdict", "explanation".
        The verdict key holds 'FACT', 'CAP' or 'SUS' (suspicious/uncertain; might be partly true, misleading, or lacking enough context to decide), 
        The speaker key holds 'Speaker A' or 'Speaker B', based upon who is proposed the idea we are evaluating. 
        For example, if Speaker A says "The sky is blue" and Speaker B says "No, the sky is green", then the speaker key should hold 'Speaker A' because we are evaluating their claim. 
        The explanation key holds a short 1-2 sentences explaining the answer, incorporating both arguments and quantitative stats (actual numbers) and source names if possible. 
        total response max 70 words.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )

    dictionary_response = json.loads(clean_json_string(response.text))
    return dictionary_response

def score_arguments(textinput):
    score_arguments_prompt = f"""
        score the following arguments: {textinput}. Be accurate and fast. 
        Respond in dictionary format with keys "Speaker", "score", "explanation".
        The score key holds an integer from 0 to 100, with 0 being no arguments hold, and 100 being all arguments hold.
        The explanation key holds a short 1-2 sentences explaining the answer, incorporating both arguments and quantitative stats (actual numbers) and source names if possible.
        total response max 70 words.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=score_arguments_prompt,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
        ),
    )

    dictionary_response = json.loads(clean_json_string(response.text))
    return dictionary_response




example_argument = """
[
        {"Speaker": "Person A", "Text": "There are 93 million Egyptians sneaking in to the American borders right now!"},
        {"Speaker": "Person B", "Text": "That's not true."},
        {"Speaker": "Person A", "Text": "Yes it is! I saw it on Fox News."},
        {"Speaker": "Person B", "Text": "Fox News is not a reliable source. According to the Migration Policy Institute, there are about 13 million unauthorized immigrants in the U.S."},
        {"Speaker": "Person A", "Text": "Well, I heard from a friend that the number is much higher."},
        {"Speaker": "Person B", "Text": "Hearing from a friend is not a credible source. The Pew Research Center estimates that the number of unauthorized immigrants in the U.S. is around 11 million."}
    ]
"""

if __name__ == "__main__":
    print(fact_check(input_str))
    print(score_arguments(input_str))