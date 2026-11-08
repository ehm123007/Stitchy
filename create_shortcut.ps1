$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)

# 1. Shortcut to Launch_Website.vbs on Desktop
$ShortcutFile = Join-Path $DesktopPath "STITCHY - Open Website.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = '"""C:\Stitchy gemini\Launch_Website.vbs"""'
$Shortcut.WorkingDirectory = "C:\Stitchy gemini"
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = "shell32.dll,13"
$Shortcut.Description = "One-click launcher for STITCHY Pure Export Clothing Website"
$Shortcut.Save()

# 2. Also create one in the workspace folder
$LocalShortcutFile = "C:\Stitchy gemini\STITCHY - Open Website.lnk"
$LocalShortcut = $WshShell.CreateShortcut($LocalShortcutFile)
$LocalShortcut.TargetPath = "wscript.exe"
$LocalShortcut.Arguments = '"""C:\Stitchy gemini\Launch_Website.vbs"""'
$LocalShortcut.WorkingDirectory = "C:\Stitchy gemini"
$LocalShortcut.WindowStyle = 1
$LocalShortcut.IconLocation = "shell32.dll,13"
$LocalShortcut.Description = "One-click launcher for STITCHY Pure Export Clothing Website"
$LocalShortcut.Save()

Write-Host "Shortcuts created successfully!"
