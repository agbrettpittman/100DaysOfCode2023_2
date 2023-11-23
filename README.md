# 100DaysOfCode2023_2

This is my 2nd run through the 100 Days of Code challenge. I completed the challenge earlier this year as well. I previously started in January. This time I'm starting in November and plan to continue starting at that time each year (so hopefully I don't end up with another "..._2" directory / repo again). Last year I posted all of my log entries on Twitter. With the recent changes to Twitter (now X) and because I don't have premium, I am publishing on X and LinkedIn to hopefully get a bit more engagement. You can find my log entries on both of those. If I miss a day I simply add a day to the end of the challenge (Although I try to never miss a day, things do come up). I'll try to post my log entries here as well (I'll just copy from LinkedIn since it allows for longer posts). Below is a chart of each day's main activity. I'm also including a legend for the chart below.

## Activity Overview

### Legend

🟪 = iCodeThis Challenge
🟨 = GraphQL
🟦 = TypeScript
❌ = Missed Day

### Chart

🟪🟨🟨🟨🟨🟨🟨🟦🟦🟦

## Log

### Day 10: November 22, 2023

Nearly finished with the TypeScript intro course. Only a couple of videos left. Today was some of the more "typescript-y" things like enums, generics, duck typing, and converting a webpack project. Tomorrow I'll finish and start the react + TS course

### Day 9: November 21, 2023

Got about halfway through the typescript course. While it is interesting, I am wondering if it would take building an app with it to see the full value.

### Day 8: November 20, 2023

Finished the Level Up Tutorials GraphQL course today! There wasn't much left, so I started the Level 1 Typescript course today. While I'm not particularly interested in TypeScript, many say it's life-changing and that once you try it you'll never go back to vanilla JS. So, 100 Days of Code seems like a good chance to give it a fair shot.

### Day 7: November 19, 2023

Today was all about subscriptions and getting those working with GraphQL. I got hung up for a while because Apollo Server no longer natively supports subscriptions (you have to use their express plugin), so I had to hunt down the differences between that and the tutorial I was watching. That's not the fault of the tutorial though, given I assumed the risks of things like that happening when I didn't specify the lower version used in the tutorial (I wanted to get used to and experience the latest packages / standards). Also, it's a free tutorial, so one can only expect so much. Still, I got it figured out and working 🤘🏼

### Day 6: November 18, 2023

Docker saved the day with my mongo troubles. It seems the problem was interaction between running Mongo on windows, but my test app on WSL. Moving to a docker container seems to have cleared things up pretty easily. All hail Docker. Also managed to connect my app to Mongo and start creating entries in Mongo from my GraphQL API.

### Day 5: November 17, 2023

worked on setting up a @MongoDB on for the graphql server I'm working on. The docs said Mongo didn't support WSL, so I spun up the server on windows while the GraphQL app is on WSL. This appears to be causing complications that I haven't quite figured out. Tomorrow I may end up spinning up a Mongo container instead. Especially since Mongo isn't typically my preferred DB and installing on Windows also isn't typically my preference. Docker may be a better route overall.

### Day 4: November 16, 2023

78% through the Level Up Tutorials GraphQL tutorial. Today was learning about mutations, context, and fragments (among other things). The context portion answered some questions I had about how auth and sharing a DB connection pool would be handled. Mutations were interesting, although the feeling of redundancy was pretty strong. I do see where query and mutation parameters may vary, but the amount of repetition is still not one of my favorite things. Given that using the gql function is just using a template literal...I suspect some of that redundancy could be reduced by defining some reusable strings elsewhere and injecting those into the template literal.

### Day 3: November 15, 2023

Still going with the Level Up Tutorials GraphQL tutorial. Today was lots of information about resolvers and a bit of fun with custom scalar types. The custom scalars seemed like a cool tool for validating data. As the *tiny* API grows, it definitely feels like a bit more to juggle than similarly simple REST APIs I've built in the past. Maybe it would be good to rebuild the same API Express at the end of this to see how different the dev ex is when compared side by side with the same language (JS)

### Day 2: November 14, 2023

started the Level Up Tutorials "How To Make A GraphQL API" tutorial by Scott Tolenski. Got about 35% of the way through. Decided to build a simple song list CRUD system. The tutorial is using Apollo Server, so that's new to me as well. It seems like a pretty simple system to just get off of the ground. I'd be curious to see how it handles things like auth tokens in headers, file streaming, and breaking your code up into several files (FastAPI uses routers for this). But that's a bit beyond a simple CRUD system.

### Day 1: November 13, 2023

This is my second time around with hashtag#100daysofcode. Due to the recent changes on Twitter / X, I'm not seeing quite as much interaction as last year, so I'm giving linked in a try. Always open to suggestions for what to try this year! Today I only had an hour to burn, so I worked on a CSS / HTML challenge from iCodeThis.