module.exports = {
    Tags: [
        {
            id: 1,
            name: "Classic"
        },
        {
            id: 2,
            name: "Powerful Vocals"
        },
        {
            id: 3,
            name: "Classic"
        },
        {
            id: 4,
            name: "Heavy"
        },
        {
            id: 5,
            name: "Dark"
        },
        {
            id: 6,
            name: "Angry"
        },
        {
            id: 7,
            name: "Catchy"
        }
    ],

    Songs: [
        /*
            mutation AddSong {
                addSong(song: {
                    title: "Beer For My Horses",
                    artist: "Toby Keith",
                    releaseDate: "2003-11-10 00:00:00",
                    genre: "Country",
                    rating: 3,
                    status: LISTENED,
                    tags: [
                    {id: 7}
                    ]
                }) {
                    id
                    title
                    artist
                    releaseDate
                    genre
                    rating
                    status
                    tags {
                    id
                    name
                    }
                }
            }
        */
        {
            id: 1,
            title: "Bohemian Rhapsody",
            artist: "Queen",
            releaseDate: "1975-10-31 00:00:00",
            genre: "Rock",
            rating: 5,
            tags: [
                {id: 1},
                {id: 2}
            ],
        },
        {
            id: 2,
            title: "Uptown Funk",
            artist: "Mark Ronson",
            releaseDate: "2014-11-10 00:00:00",
            genre: "Funk",
            rating: 4
        },
        {
            id: 3,
            title: "No More Tears",
            artist: "Ozzy Osbourne",
            releaseDate: "1991-11-10 00:00:00",
            genre: "Metal",
            rating: 5,
            tags: [
                {id: 3},
                {id: 4},
                {id: 5}
            ],
        },
        {
            id: 4,
            title: "Blank Space",
            artist: "Taylor Swift",
            releaseDate: "2014-11-10 00:00:00",
            genre: "Pop",
            rating: 3,
            tags: [
                {id: 7}
            ],
        },
        {
            id: 5,
            title: "Many Men",
            artist: "50 Cent",
            releaseDate: "2003-11-10 00:00:00",
            genre: "Hip Hop",
            rating: 4,
            tags: [
                {id: 5},
                {id: 6}
            ],
        },
        {
            id: 6,
            title: "Omen",
            artist: "The Prodigy",
            releaseDate: "2009-11-10 00:00:00",
            genre: "Electronic",
            rating: 2,
            tags: [
                {id: 7}
            ],
        },
        {
            id: 7,
            title: "Cowboys From Hell",
            artist: "Pantera",
            releaseDate: "1990-11-10 00:00:00",
            genre: "Metal",
            rating: 5,
            tags: [
                {id: 4},
                {id: 6}
            ],
        },
        {
            id: 8,
            title: "Not The American Average",
            artist: "Asking Alexandria",
            releaseDate: "2011-11-10 00:00:00",
            genre: "Metal",
            rating: 3,
            tags: [
                {id: 4}
            ],
        }
    ]

}