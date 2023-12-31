# 100DaysOfCode2023_2

This is my 2nd run through the 100 Days of Code challenge. I completed the challenge earlier this year as well. I previously started in January. This time I'm starting in November and plan to continue starting at that time each year (so hopefully I don't end up with another "..._2" directory / repo again). Last year I posted all of my log entries on Twitter. With the recent changes to Twitter (now X) and because I don't have premium, I am publishing on X and LinkedIn to hopefully get a bit more engagement. You can find my log entries on both of those. If I miss a day I simply add a day to the end of the challenge (Although I try to never miss a day, things do come up). I'll try to post my log entries here as well (I'll just copy from LinkedIn since it allows for longer posts). Below is a chart of each day's main activity.

## Activity Overview

### Legend

- 🟪 = iCodeThis Challenge
- 🌴 = GraphQL
- 🟦 = TypeScript
- 🐲 = Practice Project (Character Manager) [ 🌴 , 🟦 ]
- ❌ = Missed Day

### Chart

- 🟪🌴🌴🌴🌴🌴🌴🟦🟦🟦🟦🟦🟦🐲🐲🐲🟪🐲🟪🐲
- 🐲🟪🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲
- 🐲🐲🐲🐲❌🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲🐲

## Log

### Day 56, January 08, 2024

Got image uploads working in a "perfect world" scenario. image changes and deletions sync with the server. Currently, I'm working on error handling and recovering from a bugged state.

### Day 55, January 07, 2024

Working on allowing users to edit the images of a character right now. Ran into a CORS problem I haven't encountered before, but that's not a problem. Modifying a character's images is proving a bit more difficult than I expected, but I think that might be a programmer's slogan, hah. I have an idea of where I'm going, so that's up from where I was at with initial photo upload on character creation.

### Day 54, January 06, 2024

Today was a bit simpler than the past few. The view for uploaded images was driving me crazy, so I tweaked it to size a bit better, setup a lightbox, and had AI generate a little dragon logo to replace the emoji I had been using.

### Day 53, January 05, 2024

Made some progress on cleaning things up for the image handling. Got CORS setup for the express route for downloading files. Set that route up to validate that a user has a valid auth token in their authorization header. Then I created a component for rendering images from said newly protected route. This was needed (or at least helpful to break into a separate component) because the authorization header needed to be set. Lastly, I improved the Character view page's UI a bit by converting the buttons to some little icons that share a common design style. 

### Day 52, January 04, 2024

Got pretty frustrated today with the lack of progress, so I spent a while this evening and after much research eventually figured out both uploading images for a character and downloading (viewing) them. It is pretty rough and needs major cleanup, security tightening, and optimization. But image upload and download work. And I know where to go from here. In my humble and unknowledgeable opinion, it's a bit...odd...that graphql doesn't seem to have a good solution for file download beyond "use a separate service". I rigged it up by creating a separate express route that serves files. So it works, and it isn't technically a separate service. However, it isn't integrated directly with graphql, which I'm not a fan of. It doesn't turn me away from graphql, but it certainly is not what I would expect from an API spec.

### Day 51, January 03, 2024

Today I locked down the input UI for images and their details and started working on how exactly to get the images to upload. If I can get it working for creation, I suspect updates will be easier. Then I'll need to figure out returning images from the api.

### Day 50, January 02, 2024

More work today on image uploads. Created the UI for removing images and a skeleton for adding a caption to the image and selecting one as your primary photo for that character.

### Day 49, January 01, 2024

Today I started on what will likely be the most complicated part of the app: handling images. To save some time I used what appears to be a headless component (react-dropzone). I've built a file uploader in the past, so I'm not super interested in redoing that (or porting the code from it to this project). Got the HTML and CSS tied to the hook for that. After that I squashed a couple of bugs. One was with the nav bar scrolling when it shouldn't. The other was due to not deleting the Access Token and Refresh Token when reauthenticating with a refresh token fails.

### Day 48, December 31, 2023

Got character creates working with the new character creation page, added a react context to make the nav bar on the side add characters and change their information. Lastly, I replaced the edit and delete buttons with Material UI ones. Struggled some more with Typescript today not properly interpreting the type safety of my code, but figured out a way around it that wasn't just using type assertions to make the error go away. So, I'm slowly getting to where I think I understand it a bit more and can "figure things out".

### Day 47, December 30, 2023

Today was probably a bit less productive than usual, but that was mainly due to me not knowing material UI well (but I'm getting used to it!). I created a "create character" page (no functionality yet, because I'll have to modify how that was being handled before). Then I changed out the Vite icon for a dragon from styled icons, and fixed a little bug in the search bar where the actual input wasn't extending to fit the container for it.

### Day 46, December 29, 2023

User logout now works, I branded the landing page in the most basic way humanly possible, got type generation on the backend working, added some advanced searching for characters to the API, and used that to make the navbar on the side only list your characters (rather than all characters)

### Day 45, December 28, 2023

Didn't have any time at all yesterday to do the 100 Days yesterday. I still coded for work, but I try not to count that...this is for exploring new tech, not just getting work done haha. Today I converted the layout of the app to use CSS Grid instead of being static. I also added a nice header bar for the app. It doesn't really do anything, but I needed somewhere to stick a logout button hah.

### Day 44, December 26, 2023

Today was breaking the sidebar into it's own component. I'm a firm believer in separation of concerns, and I see no reason that the navigation's data handling should be tied in its entirety to the root route. So I set about making it a component. This meant I could no longer rely on some of the react router dom niceties like the loader. So I broke that into a function and side effect based on the change of the useSearchParams hook that react router has. down the road I can create a context for it if needed, but I doubt it. I suspect that subscriptions will help later on.

### Day 43, December 25, 2023

Got a few things done today. I altered the MUI theme colors. I made the backend logging more useful so that it displays in a simpler format what the request type was, what specific resolver was called, and if it was a success or failure. Lastly, I got the sidebar from the React Router tutorial into styled-components.

### Day 42, December 24, 2023

I believe refresh tokens are working at the moment. Tomorrow will be the real test. I'm not entirely sure why, but I've always found handling refresh tokens to be a bit complicated.

### Day 41, December 23, 2023

Today was getting user signups working. I had planned on working on refresh tokens, but decided I wanted to get user signups working first. Definitely loving Material UI... it magically makes everything look at least decent.

### Day 40, December 22, 2023

Much more productive day today. I got adding character attributes working, created a login page, added a route that will automatically take you to the login page if your token expires, and integrated Material UI. Tomorrow I need to work on integrating the refresh tokens I have the API sending.

### Day 39, December 21, 2023

Typescript was kicking my absolute tail today, but finally got the ability to edit the attributes of a given character working. At times it seems like TS's logic parser can't connect certain statements, other-times it feels like magic. I suspect it just takes getting used to and learning the little "gotchas" like everything else.

### Day 38, December 20, 2023

Today I added the ability to set a given character as private, added 404 errors that allowed the nav to still be visible, and converted the routes to the JSX format. I definitely prefer that format, and it's similar to what I've done in the past when working with React Router. That finished the React Router tutorial. I started on personal changes now to fill in the gaps that the tutorial didn't necessarily cover. I started with working on making character attributes editable. 

### Day 37, December 19, 2023

Got live searching when the user types in the search bar working, detecting when data is loading, the API now has a way to specify a given character as "private" to that user, and the frontend can display that that character is private.

### Day 36, December 18, 2023

Got a simple index route setup, character deletion working, and searching by character name working. The query variables type from Apollo code gen did not get picked up, instead, it was put in the query args type. Not sure why or when to use one or the other. the code gen seems to export quite a few types and I'm having a difficult time deciphering when to use the different options.

### Day 35, December 17, 2023

Got editing characters working. I'll need to add more in-depth editing in the future. I'm slowly understanding typing more. My brother gave me an idea for a name for the project: Lair of the Ancients. This is based on some Dungeons and Dragons lore that ancient dragons are able to shapeshift...similar to how RPG / tabletop players, fictional writers, and cosplayers "shift" into their various characters.

### Day 34, December 16, 2023

Added the ability to go to the page of a given character and pull their data from the API. Ran into a problem for a bit caused by Apollo caching data by default, so had to disable that. At the same time as learning about GQL and TS, I'm also learning about browser routing with React Router. The last couple of times I used RR I used hash routing. Browser routing looks like it's better, so I'm trying to use that as well. 

### Day 33, December 15, 2023

Thanks to ChatGPT I feel like I halfway understand the types from @apollographql code gen. Not very well, but a bit. I also got character creates working from the frontend. Lots of today was conversing with Chat to try to understand how to use the types.

### Day 32, December 14, 2023

Connected the frontend to the backend so that it's pulling a list of available characters. I also started playing with Apollo's code-gen tool. It seems like a neat tool, and a good way to allow for less type redundancy. I'm still trying to figure out typing the queries themselves. Typing the variables once they are there is easy. However, technically I don't *know* that the data will actually be there. So the answer to that would be to type the query. That seems very possible and like it should be easy; I'm just having a hard time understanding how to do it at the moment.

### Day 31, December 13, 2023

Got started on the frontend. This is the first time I've really used Vite in any earnest. I worked with it briefly last round, but not long. I switched back to CRA because my focus was on automated testing, and it appeared Jest worked better with CRA. Additionally, our production React apps used CRA, so CRA was more applicable to our environment. Now CRA is dead, so there's a distinct need to learn Vite. I am loving how fast it is. The main focus though is TypeScript. TS isn't being too bad, but it's making certain things more difficult than it normally would be. That's how any new technology is going to be though, so I'm not holding it against TS (yet). Plus, I'm sure the things I'm accounting for I should have been anyways.

### Day 30, December 12, 2023

I believe the API is mostly in a good place. Today I got editing image details, deleting images, deleting characters, all working and I fixed a bug that was preventing image details from being set correctly. I do need to go back through and actually take advantage of TypeScript throughout the Apollo GraphQL API, but I'll be focusing on understanding TypeScript while working on the frontend, which I'll start tomorrow. Hopefully by the end of that I'll have a good enough understanding of TypeScript to efficiently go back through and add more types to the API side.

### Day 29, December 11, 2023

I'm thinking file uploads are in a good place now. Most parts are in isolated utility functions, and error handling is working well. Need to handle deleting the files, modifying their captions, and selecting a main photo for the character. After that, I think I'll be good to move onto the front-end! This has taken longer than expected, but that is at least partially because I am having to come up with the architecture as well as learn the new frameworks. Once I have this done this time, it should be easier with future languages and frameworks as the architecture will already exist.

### Day 28, December 10, 2023

Working on generalizing the image handling for characters so that I don't have to worry about it again. I got the uploading of files broken out and working in a generic fashion. This also means adding files on character create now works better as well. Now I'm figuring out how to handle adding the images to characters and handling partial success. eg when uploading multiple files, if one fails, all others should be attempted independently. Additionally, if you are uploading the files with a character creation, if something happens when uploading the files, but the actual creation of the character succeeds, you should still create the character, and alert the user of what exactly failed.

### Day 27, December 9, 2023

after some more research, I landed on just creating a temporary directory to save files to before validating. If an error is thrown, I either delete the erroneous file or the entire temporary directory. I was trying to avoid saving files that haven't been validated, but it does seem that that is the proper course for these things.

### Day 26, December 8, 2023

Finally figured out what was causing Apollo to hang. Essentially I was not properly handling/terminating the file streams on error. It was throwing me off because it seemed to only happen when a large file was added (that took a bit to figure out as well). Essentially, the request was being "paused" while the files were being read, and I was handling file validation as I read them in (so as to not save files unnecessarily to the server). So if an error was thrown while the file's read stream was open, the stream was not being properly closed, so the request was not being properly closed. Adding a `response.end()` to the catch of my resolver fixed this and properly passed the error to the server. This is the kind of stuff I was hoping to discover with this practice project, so this is a good thing.

### Day 25, December 7, 2023

I got uploading new files for a given character working. I started working on rolling back all uploads in a given request if there is a failure. I ran into an odd problem where Apollo's sandbox would hang and no longer be accessible at all. It seems to happen primarily when I try to submit multiple requests while one or more is hanging. It also seems like the sandbox either doesn't have a timeout, or a very high one. Trying to fix that took up a decent bit of time as well. The requests seemed to hang when throwing errors, so that was interesting too.

### Day 24, December 6, 2023

Pretty cool day today! I took what I figured out about uploading files and made it so that when you create a character you can upload multiple images for it along with an array specifying details about those images. This is all done via the API sandbox at the moment of course. I haven't gotten to the React frontend portion yet. The API will then map the images' filenames to the details array. It'll throw an error if it finds multiple images with the exact same file name. I'll make the frontend automatically give unique filenames when the user uploads the files, as the filenames are only necessary for the mapping. The details array contains information like the caption for the picture or if it is the character's main photo. The original file name is then discarded and a generic one is generated before being saved to the server for security purposes.

### Day 23, December 5, 2023

Had to do today's session from work again, so I did the iCodeThis iCodeMas challenge for day 5. Today's challenge was a bit easier, so I actually got to add some javascript functionality and a couple of small animations!

### Day 22, December 4, 2023

Figured out what was going on with CSRF blocking my requests, then got file validation working (I'm locking the file uploads down to just images). Had to research a bit as to the best way to handle file validation and landed on using the mmmagic package.

### Day 21, December 3, 2023

Got file uploads working today. It took quite a bit of effort. The recommended graphql-upload library did not work well with TS, so I replaced it with the graphql-upload-ts that is largely a drop-in replacement. Then I had to turn off CSRF prevention as that kept throwing errors when testing from the sandbox. I'll explore that tomorrow.

### Day 20, December 2, 2023

As much as I'd like to participate in iCodeThis's iCodeMas, I suspect I'll get more out of the 100 Days by focusing on what I wanted to learn. So, back to the practice project. Finally figured out auto restarting TS (should have been simple, I'm sure, but took a bit of research). I also got updates working and fixed a bug where updates and transfers were not returning the new values.

### Day 19, December 1, 2023

Worked on Day 1 of the iCodeThis iCodeMas challenge. Got the initial visuals done and decided it'd be cool to have little candy canes rotating above the card numbers. That part proved very difficult, so I didn't get to finish that in time. I'll need to use inkscape next time. I decide to create graphics like that on the fly.

### Day 18, November 30, 2023

Back to working on the practice project. Today I got parsing and validating the JWT in the GraphQL context, character creation, and transferring a character working. yay!

### Day 17: November 29, 2023

I was at work during this coding session, so rather than getting my full env for my practice project spun up there, I did an iCodeThis challenge today. I'm fairly happy with the results given that I limit myself to an hour for the challenges, so this is all in less than an hour with straight HTML and CSS. A lot of stuff definitely doesn't match the prompt, but, for me at least, the prompts are typically pretty challenging to complete in less than an hour (including writing the actual HTML). Therefore, part of the exercise is figuring out what the most important aspects are and which ones can be left off. I hate I didn't get to the dropdown for the pro version, but I spent a bit too much time on the grid for the options

### Day 16: November 28, 2023

I think I've got auth working on the API side. Today I got refresh tokens to be stored in the MongoDB, created a route for extending the expiration on a token, and one for logging users out.

### Day 15: November 27, 2023

Worked some more on the practice project. I broke my Mongoose schema and GraphQL typedefs and resolvers into separate files and ran into several issues with TypeScript. once I figured those out I got logins working with JWTs as the tokens. Probably will add refresh tokens to the DB tomorrow along with logouts and that will probably be about as far as I go with authentication. Authorization will be implemented as the features requiring it are.

### Day 14: November 26, 2023

Started on a small project to tie the last 2 weeks together. My wife gave me the idea of a "character manager" where users can create fictional characters, and then transfer the rights to those characters to others. There are currently other tools that allow for this; however, the point is to practice technology, not to implement an end-to-end solution. Definitely will not be implementing any kind of payment. That is WAY out of the scope of this practice project. Still, it's a project that I plan to iterate over and "redo" to test out new technologies since it covers several topics at a high level...basic CRUD, user auth and sessions, permissions, file uploads, and associations between entities.

Today I got the Mongo DB turned up, and user creation from the GraphQL API working (including salting and hashing of the passwords)

### Day 13: November 25, 2023

Finished Byte Grad's TypeScript in React course. It was very in-depth, and definitely a bit difficult to code along with. It's also a ton of knowledge to try to retain. It ended with 30 min to spare, so I watched David Gray's React Typescript Tutorial for Beginners video. I loved that one. It was super easy to code with and solidify concepts from the other videos. Tomorrow I'll start on a small practice project to tie in everything. Heck, maybe I'll make it using GraphQL too.

### Day 12: Nuvember 24, 2023

I'm about 3/4 through ByteGrad's TypeScript in React crash course. Lots of concepts today, but conceptually, most of it is starting to make sense. The "as const" keyword seems fairly useful, as well as the "&" operator.

### Day 11: November 23, 2023

Finished the Scott Tolinski Level 1 Typescript Tutorial on Level Up Tutorials. Started out on the React + TS one, but it appeared quite a few things from the intro video were out of date, so I found a crash course by ByteGrad and started that. The ByteGrad course moves at a pretty breakneck pace and I've had to stop it several times. Still, it seems pretty informative!

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
