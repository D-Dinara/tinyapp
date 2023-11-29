# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["The main page displays a user's URLs"](/docs/urls_index.png)
!["The URL edit page displays statistics and allows a user to edit a long URL"](/docs/urls_show.png)
!["The page allows a user to create a short URL by submitting a long URL"](/docs/urls_new.png)
!["The login page"](/docs/url_login.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Functionality developed

* User Authentication:
  * Users can register with a unique email and password.
  * Passwords are hashed using bcrypt for security.
  * Registered users can log in, and their session is tracked using cookies.
  * Users can log out, clearing the session cookie.
* URL Shortening:
  * Registered users can create short URLs by submitting the long URL.
  * Each short URL is associated with the user who created it.
  * Users can view their list of shortened URLs along with details such as visit count, unique visitors, and visit history.
* URL Redirection:
  * Accessing a short URL redirects to the original long URL.
  * Unique visitors are tracked, and visit history is recorded.
* URL Management:
  * Users can edit the long URL associated with their short URLs.
  * Users can delete their short URLs.
* User Interface:
  * The application uses the EJS template engine to render dynamic views.
  * Different views are presented based on whether the user is logged in or not.
  * Proper error messages and status codes are returned for various scenarios (e.g., invalid URL, unauthorized access).
* Middleware and Dependencies:
  * The application uses express, cookie-session, bcryptjs, and method-override.
  * express.urlencoded middleware is used to parse the request body.
  * cookie-session middleware is used for encrypted session cookies.
  * method-override middleware allows using HTTP methods like PUT and DELETE.


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command. 