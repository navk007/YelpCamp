const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')
const usersRoutes = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user')


mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database Connected');
    })
    .catch(err => {
        console.log(err);
        console.log("Database not Connected");
    })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

//express-session
const sessionConfig = {
    secret: 'thisshoudlbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()))
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//  routers
app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'Navdeep@gmail.com', username: 'Navk007' });
    const newUser = await User.register(user, 'ronaldo');
    res.send(newUser);
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Error found.... Hopefully i will solve it', 404))
})

app.use((err, req, res, next) => {
    const { status = 404 } = err;
    if (!err.message) err.message = 'Page not found'
    res.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log("SERVER IS ON");
})