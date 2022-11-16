import pandas as pd 
from nltk.sentiment import SentimentIntensityAnalyzer

def maxsentiment(dict):
    if dict['neg']>dict['pos']:
        return 'Negative'
    else:
        return 'Positive'

df  = pd.read_csv('DiabetesDaily.csv')
print(df.head(5))

sia = SentimentIntensityAnalyzer()

MajoritySentiment, PolarityScores = [],[]
for i,r in df.iterrows():
    try:
        text = r['Text (OP) '] + r['Reply 1'] + r['Reply 2'] + r['Reply 3']
        scores = sia.polarity_scores(text)
        MajoritySentiment.append(maxsentiment(scores))
        PolarityScores.append(scores)
    except:
        MajoritySentiment.append('')
        PolarityScores.append('')
df['MajoritySentiment'] = MajoritySentiment
df['PolarityScores'] = PolarityScores  
    
df.to_csv('DiabetesDaily.csv', index=False)