Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get current script directory
ScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Check if server is already running by attempting to ping or start
WshShell.CurrentDirectory = ScriptDir

' Run the node server hidden (0 = hide window)
WshShell.Run "cmd /c node server/server.js", 0, False

' Wait 2 seconds for server to start
WScript.Sleep 1800

' Open the browser to localhost:5000
WshShell.Run "cmd /c start http://localhost:5000", 0, False
