Set FontSize 20
Set Width 1600
Set Height 900
Set TypingSpeed 200ms 
Set PlaybackSpeed 0.8
Output docs/images/create-exe.gif

Hide
Type "rm vhs-temp -rf"
Enter
Sleep 4s
Type "mkdir vhs-temp && cd vhs-temp && clear"
Enter
Sleep 4s
Show

Type "verace create-exe"
Sleep 1s
Enter
Sleep 4s
Down
Sleep 2s
Enter
Sleep 4s
Type "my-awesome-package"
Sleep 1s
Enter
Sleep 4s
Enter
Sleep 12s
Type "verace build-exe"
Sleep 1s
Enter
Sleep 6s
Type "./bin/my-awesome-package"
Sleep 4s
Enter
Sleep 6s

Hide
Type "cd .. && rm vhs-temp -rf"
Enter
Sleep 4s
Show

