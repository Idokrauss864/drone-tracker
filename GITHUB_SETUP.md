# GitHub Setup Instructions

Your project is now ready to be pushed to GitHub! Follow these steps:

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Repository name: `drone-tracker` (or `drone-map-tracker`)
5. Description: "Real-time drone tracking system with interactive map"
6. Choose **Public** or **Private**
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click **Create repository**

## 2. Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/drone-tracker.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## 3. Verify

1. Go to your repository on GitHub
2. You should see all your files including the README.md
3. The README should render nicely with all the sections

## 4. Optional: Add a Screenshot

1. Take a screenshot of your map view
2. Save it as `screenshot.png` in the root directory
3. Update README.md to use the actual screenshot:

```markdown
![Drone Tracker](./screenshot.png)
```

4. Commit and push:

```bash
git add screenshot.png README.md
git commit -m "Add project screenshot"
git push
```

## 5. Optional: Add License

If you want to add a license:

1. Go to your repository on GitHub
2. Click **Add file** → **Create new file**
3. Name it `LICENSE`
4. GitHub will suggest templates - choose MIT License (or your preferred license)
5. Commit the file

## Done! 🎉

Your project is now on GitHub and ready to share!

