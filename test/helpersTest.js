const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
chai.use(chaiHttp);

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('returns a user object when provided a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('returns undefined for a non-existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });
});


describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");
    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then(() => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

describe('GET /', () => {
  it('should redirect to /login', () => {
    return chai.request('http://localhost:8080')
      .get('/')
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });
});

describe('GET /urls/new', () => {
  it('should redirect to /login', () => {
    return chai.request('http://localhost:8080')
      .get('/urls/new')
      .then((res) => {
        expect(res).to.redirect;
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });
});

describe('GET /urls/NOTEXISTS', () => {
  it('should return status code 404', () => {
    return chai.request('http://localhost:8080')
      .get('/urls/NOTEXISTS')
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });
});

describe('GET /urls/b2xVn2', () => {
  it('should return status code 403', () => {
    return chai.request('http://localhost:8080')
      .get('/urls/b2xVn2')
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });
});

