# Space-sim Simulator

This app simulates a "traditional" open-world space-sim ecology.

* Traders move goods between stations for a profit.
* Pirates attack traders to steal their goods.
* Hunters attack pirates for a reward.

New ships tend towards options giving the most profit at the time,
while ships making a loss are most likely to give up and retire.

The location board abstracts a lot of the actual "flying around in 3D"
stuff. Ships launch from the left, and dock at the right. Ships in the
same location can try to intercept each other, if they want to.

The app runs entirely in Javascript in a browser, and can be built and
run entirely from disk without needing a web server.

## Challenges

The basic challenge is to make settings which:

* Cause all three professions to make roughly similar average profits
* Are stable long-term (a few thousand cycles at least, repeatedly)

The initial settings are certainly not that - they're roughly based on
[Oolite](http://www.oolite.org/), with the Cobra I, Krait and Asp as
the ships.