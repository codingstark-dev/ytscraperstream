DROP TABLE IF EXISTS UrlData;
CREATE TABLE IF NOT EXISTS UrlData (
    url VARCHAR(255) NOT NULL
);
INSERT INTO UrlData (url) VALUES ('http://www.google.com');