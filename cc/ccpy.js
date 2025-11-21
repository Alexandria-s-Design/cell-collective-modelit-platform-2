import { PythonShell } from "python-shell";

export default (...args) => {
    const options = {
        pythonOptions: ["-u", "-m"],
        args: args
    }

    return new Promise((resolve, reject) =>
        PythonShell.run("ccpy", options, (err, results) =>
            results ? resolve(results.join("\n")) : reject(err)
        )
    )
}