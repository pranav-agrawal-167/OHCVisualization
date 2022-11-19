import pandas as pd 
from nltk.sentiment import SentimentIntensityAnalyzer
import re

def maxsentiment(dict):
    if dict['compound']>0.3:
        return 'Positive'
    elif dict['compound']<=0.3 and dict['compound']>=-0.3:
        return 'Neutral'
    else:
        return 'Negative'

def PersonalScore(text):
    pronounRegex = re.compile(r'\b(I|we|my|lbs|lb|kg|kgs|years|old|think|opinion|experience|old|young|ours|(?-i:us))\b',re.I)
    pronouns = pronounRegex.findall(text)
    return len(pronouns)/len(text)


df  = pd.read_csv('DiabetesDaily.csv')
print(df.head(5))

sia = SentimentIntensityAnalyzer()
MajoritySentiment, PolarityScores, CompoundSentimentScore, PersonalScores, OPSentiment, Reply1Sentiment, Reply2Sentiment, Reply3Sentiment, OPPersonal, Reply1Personal, Reply2Personal, Reply3Personal, QuestionLength = [],[],[],[], [],[],[],[], [],[],[],[], []

for i,r in df.iterrows():
    text = str(r['Text (OP) ']) + str(r['Reply 1']) + str(r['Reply 2']) + str(r['Reply 3'])
    try:
        scores = sia.polarity_scores(text)
        MajoritySentiment.append(maxsentiment(scores))
        PolarityScores.append(scores)
        CompoundSentimentScore.append(scores['compound'])
        OPSentiment.append(sia.polarity_scores(str(r['Text (OP) ']))['compound'])
        Reply1Sentiment.append(sia.polarity_scores(str(r['Reply 1']))['compound'])
        Reply2Sentiment.append(sia.polarity_scores(str(r['Reply 2']))['compound'])
        Reply3Sentiment.append(sia.polarity_scores(str(r['Reply 3']))['compound'])
    except:
        MajoritySentiment.append('')
        PolarityScores.append('')
        CompoundSentimentScore.append('')
        OPSentiment.append('')
        Reply1Sentiment.append('')
        Reply2Sentiment.append('')
        Reply3Sentiment.append('')
    try:
        PersonalScores.append(PersonalScore(text))
        OPPersonal.append(PersonalScore(str(r['Text (OP) '])))
        Reply1Personal.append(PersonalScore(str(r['Reply 1'])))
        Reply2Personal.append(PersonalScore(str(r['Reply 2'])))
        Reply3Personal.append(PersonalScore(str(r['Reply 3'])))
    except:
        PersonalScores.append('')
        OPPersonal.append('')
        Reply1Personal.append('')
        Reply2Personal.append('')
        Reply3Personal.append('')
    QuestionLength.append(len(text))


df['MajoritySentiment'] = MajoritySentiment
df['CompoundSentimentScore'] = CompoundSentimentScore
df['PolarityScores'] = PolarityScores  
df['PersonalScores'] = PersonalScores
df['OPSentiment'] = OPSentiment
df['Reply1Sentiment'] = Reply1Sentiment
df['Reply2Sentiment'] = Reply2Sentiment
df['Reply3Sentiment'] = Reply3Sentiment
df['OPPersonal'] = OPPersonal
df['Reply1Personal'] = Reply1Personal
df['Reply2Personal'] = Reply2Personal
df['Reply3Personal'] = Reply3Personal
df['QuestionLength'] = QuestionLength
df.to_csv('DiabetesDaily.csv', index=False)