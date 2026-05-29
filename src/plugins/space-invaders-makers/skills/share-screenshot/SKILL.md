---
name: share-screenshot
description: 'Use this only when a user explicitly asks to upload or share a screenshot image file to the Lab 502 Community Hub. Resolve the image path before uploading.'
argument-hint: 'Absolute path to the screenshot file to share; ask for a path if none is available'
---

# Share Screenshot

Use this skill to share a screenshot file with the Lab 502 Community Hub for the user. Do not upload a screenshot unless the user explicitly requested sharing/uploading it to the Lab 502 Community Hub or confirms the upload after being asked.
If the user does not provide a screenshot path and no recently captured screenshot path is available, ask the user for the file path before running any script.

## Use This Skill When

- Use this skill only when the user explicitly asks to upload or share a screenshot image file to the Lab 502 Community Hub, using phrases such as 'send screenshot', 'share this screenshot', or 'upload the screenshot'.
- After capturing a screenshot, use this skill only if the user explicitly requested upload/sharing or confirms that the screenshot should be uploaded to the Lab 502 Community Hub.
- Do not use this skill for live screen sharing, non-screenshot images, attachments to other chats, or uploads to other destinations.

## Steps

1. If the user provides a file path, convert it to an absolute path. If no path is provided or multiple screenshot candidates exist, ask the user to specify the screenshot file before continuing.
2. Verify the file exists.
3. Detect the operating system of the environment where the command will run. Use the PowerShell script on Windows and the shell script on Linux or macOS.

### On Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File "<PLUGIN_ROOT>\skills\share-screenshot\scripts\share-screenshot.ps1" -ImagePath "<ABSOLUTE_IMAGE_PATH>"
```

Set `<PLUGIN_ROOT>` to the directory containing this skill package. If the plugin root cannot be determined from the runtime environment, stop and report that the plugin install directory could not be located. Set `<ABSOLUTE_IMAGE_PATH>` to the verified absolute path to the screenshot file.

### On Linux / macOS

```bash
bash "<PLUGIN_ROOT>/skills/share-screenshot/scripts/share-screenshot.sh" "<ABSOLUTE_IMAGE_PATH>"
```

Set `<PLUGIN_ROOT>` to the directory containing this skill package. If the plugin root cannot be determined from the runtime environment, stop and report that the plugin install directory could not be located. Set `<ABSOLUTE_IMAGE_PATH>` to the verified absolute path to the screenshot file.

## Output and Success Criteria

The skill is successful when the script exits with code 0. If the script exits non-zero, treat it as failure and report the error to the user.

## Agent Response Style

- On success: briefly confirm that the screenshot was shared with the Lab 502 Community Hub.
- On failure: clearly state what failed and what screenshot path was attempted.
