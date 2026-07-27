# LexiAI
> **اوصيكم بتقوى الله و الكلين كود اخواتي في الله**

# Project Setup Guide
> **Important:** Before running any commands, open your terminal in the **project's root (base) directory**. Your terminal should look similar to:

```text
...\LexiAI>
```

---

## 1. Create the Virtual Environment
> **اول مره بس**

From the **base directory** (`...\LexiAI>`), create the virtual environment:

```bash
python -m venv .venv
```

---

## 2. Activate the Virtual Environment
>  كل مره علشان يشتغل 

### Windows (Command Prompt)

```cmd
.venv\Scripts\activate
```

### Windows (PowerShell)

```powershell
.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

After activation, your terminal should look similar to:

```text
(.venv) ...\LexiAI>
```

> **Important:** Always make sure `(.venv)` appears before running any `pip install` commands. This ensures that packages are installed inside the project's virtual environment.

---

## 3. Install Project Dependencies
> **Important:** كده انت بتنزل نفس الحاجات اللي اشتغل قبلك نزلها و حطها هنا

```bash
pip install -r requirements.txt
```

---

## 4. Installing New Libraries
> بعد كل pull

Before installing any new library, verify that your terminal starts with `(.venv)`.

Then install the package:

```bash
pip install <package-name>
```

Example:

```bash
pip install langchain
```

---

## 5. Update `requirements.txt`

If you install, remove, or update any package, regenerate the `requirements.txt` file **before pushing your changes to GitHub**.

First, make sure:

- You are in the **base directory** (`...\LexiAI>`).
- The virtual environment is activated (`(.venv)` is visible).

Then run:

```bash
pip freeze > requirements.txt
```

Finally, commit the updated `requirements.txt` along with your code changes.

---

## Quick Reference

```bash
# From the project root (...\LexiAI>)

# Create virtual environment
python -m venv .venv

# Activate (Windows CMD)
.venv\Scripts\activate

# Install project dependencies
pip install -r requirements.txt

# Install a new package
pip install <package-name>

# Update requirements before pushing to GitHub
pip freeze > requirements.txt
```