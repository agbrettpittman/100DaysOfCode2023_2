# GraphQL Basics

## Intro

This is follow-along code for the course [How to make a GraphQL API](https://levelup.video/tutorials/how-to-make-a-graphql-api) by Scott Tolenski on Level Up Tutorials. 
This is not even a full CRUD app...it only supports Reading Data and Creating Data.

## Technologies

- Node.js
- Apollo Server
- Express
- MongoDB
- Mongoose
- Docker

## Pre-requisites

The majority of this is self contained, with the exception of a MongoDB instance. I used Docker for this as MognoDB does not officially support WSL (which I use for development). 
I circumvented this by using Docker to run a MongoDB instance, and then connecting to it from my WSL instance. The database used is called "Song-Tracker" and the collection is 
called "songs". 