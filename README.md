# visual translator

A prototype web app that lets you upload an image (e.g. a screenshot or using your phone's camera) and then draw around words or sentences. These croppings are sent to the server where tesseract performs optical character recognition on the image to produce the text (thanks to available Farsi trained set, see Dockerfile) and then sent to the python project deep_translate which translates it using Google translate.

## Limitation

It is currently configured for Farsi (Persian) to English, but it can support any language combination that tesseract and deep_translate can handle.

## Design Goals

I'd like to be able to persist the croppings for future review and learning. This can be done via some data model like an "upload" has many "croppings" instead of just a hacked out prototype.

## Potentiality

After a few minutes review from native speakers (my parents) with respect to its performance against real-world documentation, it appears to be promising enough to justify further exploration.

## Further Exploration

It's often unclear how to pronounce certain words. Especially in Farsi, pronunciation will decrypt some ambiguous characters given that the word itself is what disambiguates individual characters. It's like a chicken and egg scenario where you need familiarity with the word in order to know the letters, but you can't learn the word from knowing letters because the letters are ambiguous until you know the word already unto which to match it from memory... Question here is can HTML5 speech synthesis (or any speech synthesis tool for that matter, be it generated on the server and sent over) utter Farsi text?