import pandas as pd 
from nltk.sentiment import SentimentIntensityAnalyzer
import re

def maxsentiment(dict):
    if dict['neg']>dict['pos']:
        return 'Negative'
    else:
        return 'Positive'

pronounRegex = re.compile(r'\b(I|we|my|lbs|lb|kg|kgs|years|old|think|opinion|experience|old|young|ours|(?-i:us))\b',re.I)
def PersonalScore(text):
    pronouns = pronounRegex.findall(text)
    if len(pronouns)>5:
        return 'Personal'
    else:
        return 'Not Personal'

df  = pd.read_csv('DiabetesDaily.csv')
print(df.head(5))

sia = SentimentIntensityAnalyzer()

MajoritySentiment, PolarityScores, PersonalScores = [],[],[]
for i,r in df.iterrows():
    text = str(r['Text (OP) ']) + str(r['Reply 1']) + str(r['Reply 2']) + str(r['Reply 3'])
    try:
        scores = sia.polarity_scores(text)
        MajoritySentiment.append(maxsentiment(scores))
        PolarityScores.append(scores)
    except:
        MajoritySentiment.append('')
        PolarityScores.append('')
    try:
        PersonalScores.append(PersonalScore(text))
    except:
        PersonalScores.append('')


df['MajoritySentiment'] = MajoritySentiment
df['PolarityScores'] = PolarityScores  
df['PersonalScores'] = PersonalScores
df.to_csv('DiabetesDaily.csv', index=False)