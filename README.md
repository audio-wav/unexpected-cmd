![](https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/unexpected_assets/unexpected-mockup.png)
# unexpected `cmd`
An open source Roblox admin commands script [Website](https://audio-wav.github.io/unexpected-cmd)
[![](https://dcbadge.limes.pink/api/server/J73SnGB2y2?style=flat)](https://discord.gg/J73SnGB2y2)

Made by **gio, ymaw.1, anbubu, .smug_.**
```lua
loadstring(game:HttpGet('https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source'))()
```
---
## bootstrapper
`unexpected cmd` offers a fast, caching bootstrapper that will make loading times faster.
```lua
local HTTP = (cloneref and cloneref(game:GetService("HttpService"))) or game:GetService("HttpService")
local VURL, SURL = "https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/version", "https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source"
local DEPENDENCIES = typeof(writefile) == "function" and typeof(readfile) == "function" and typeof(isfile) == "function"
local REMOTE = HTTP:JSONDecode(game:HttpGet(VURL))
local CACHE = DEPENDENCIES and isfile("ux_cache.json") and HTTP:JSONDecode(readfile("ux_cache.json"))
if DEPENDENCIES and (not CACHE or CACHE.version ~= REMOTE.version) then
	writefile("ux_source.lua", game:HttpGet(SURL))
	writefile("ux_cache.json", HTTP:JSONEncode(REMOTE))
end

loadstring(DEPENDENCIES and isfile("ux_source.lua") and readfile("ux_source.lua") or game:HttpGet(SURL))()
```
you can also use the one liner, much more compact but bad readability and possible compatibility issue on weaker executors.
```lua
if not (isfile("ux_cache.json") and game:GetService("HttpService"):JSONDecode(readfile("ux_cache.json")) and game:GetService("HttpService"):JSONDecode(readfile("ux_cache.json")).version==game:GetService("HttpService"):JSONDecode(game:HttpGet("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/version")).version) then writefile("ux_source.lua",game:HttpGet("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source"));writefile("ux_cache.json",game:GetService("HttpService"):JSONEncode(game:GetService("HttpService"):JSONDecode(game:HttpGet("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/version")))) end;loadstring((isfile("ux_source.lua")and readfile("ux_source.lua"))or game:HttpGet("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source"))()
```
---
## it's just perfect.*
*practically perfect. **`unexpected cmd`** delivers the best admin commands experience—both visually and logically.  
> `unexpected cmd`'s philosophy is *"it's simpler this way"*. most of the code you see is well thought out and follows this philosophy.
---
## why unexpected when you can use alternatives with more commands?
commands is not our main priority as of now, we prioritize more on the logic itself and finishing the "barebone" product of `unexpected cmd`

---
## contributing
contribution is always open and we encourage you to contribute/fork our script for your use. <3
