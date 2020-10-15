import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import "typeface-metropolis";
import { SkynetClient, SkyFile, FileID, User, FileType } from "skynet-js";

const skynetClient = new SkynetClient("https://siasky.dev");
const filename = "note.txt";
const fileID = new FileID(
  "note-to-myself-app",
  FileType.PublicUnencrypted,
  filename
);

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [skylink, setSkylink] = useState("");
  const [loading, setLoading] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const loadNote = async () => {
    try {
      const user = new User(username, password);
      const response = await skynetClient.lookupRegistry(user, fileID);

      setSkylink(response?.value?.data ?? "");
    } catch {
      setSkylink("");
    }
  };
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    await loadNote();

    setAuthenticated(true);
    setLoading(false);
  };
  const handleSetNote = async () => {
    setLoading(true);

    const file = new File([note], filename, { type: "text/plain" });
    const skyfile = new SkyFile(file);
    const user = new User(username, password);
    try {
      await skynetClient.setFile(user, fileID, skyfile);
      await loadNote();

      setDisplaySuccess(true);
      setTimeout(() => setDisplaySuccess(false), 1000);
    } catch (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (skylink) {
      fetch(skynetClient.getSkylinkUrl(skylink)).then((response) => {
        response.text().then((text) => {
          setNote(text);
        });
      });
    } else {
      setNote("");
    }
  }, [skylink, setNote]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div className="container">
          <h1>Note To Self</h1>
          {authenticated ? (
            <div>
              {!skylink && (
                <div className="mb-2">
                  <div className="flex">
                    You did not set a note yet, write one below.
                  </div>
                </div>
              )}
              <div className="mb-2">
                <div className="flex">
                  <textarea
                    value={note}
                    autoFocus={true}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleSetNote}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Save this note"}
                </button>
                {displaySuccess && (
                  <span className="success-message">
                    Your note has been saved!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mb-2">
                <label htmlFor="input">Login</label>
                <div className="flex">
                  <input
                    id="input"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
              </div>
              <div className="mb-2">
                <label htmlFor="output">Password</label>
                <div className="flex">
                  <input
                    id="output"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <div>
                  {errorMessage && <p className="error">{errorMessage}</p>}
                </div>
              </div>
              <div className="mb-4">
                <button disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </div>
            </form>
          )}
          <footer>
            Read more on{" "}
            <a
              href="https://github.com/kwypchlo/skydb-example"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </footer>
        </div>
      </header>
    </div>
  );
}

export default App;
