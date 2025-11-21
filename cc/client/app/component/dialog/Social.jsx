import React from "react";
import { Socials } from "../../cc";

export default ({ prefix }) => (
    <span>
        <hr />
        <div style={{ textAlign: "center" }}>
            or {prefix} your favourite account
        </div>

        {Object.keys(Socials)
            .map(key => ({ name: key, ...Socials[key] }))
            .map(({ name, color, title, api }) => (
                <button
                    key={name}
                    className={name}
                    style={{
                        width: "100%",
                        background: color,
                        borderColor: "#fff",
                        marginTop: "10px",
                        borderRadius: "5px",
                        color: "white",
                        padding: "10px"
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        console.log(`Using Social Login ${name}...`);
                        console.log(`Redirecting to ${api}...`);
                        window.location.href = api;
                    }}
                >
                    {prefix} {title}
                </button>
            ))}
    </span>
);
