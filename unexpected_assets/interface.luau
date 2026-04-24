--!strict

local missing = function(t, f, fallback)
	return type(f) == t and f or fallback
end :: (<T>(t: string, f: T?, fallback: T) -> T)
     & (<T>(t: string, f: T?) -> T?)

local cloneref: typeof(cloneref) = missing("function", cloneref, function(...) return ... end)

local Interface = {}
local TweenService = cloneref(game:GetService("TweenService"))
local UserInputService = cloneref(game:GetService("UserInputService"))
local RunService = cloneref(game:GetService("RunService"))
local GuiService = cloneref(game:GetService("GuiService"))

function Interface.Init(deps: {
    Theme: any,
    Settings: any,
    cloneref: any,
    RandomString: (len: number?, charset: string?) -> string,
    GetCustomAsset: (name: string) -> string,
})
    local Theme = deps.Theme
    local Settings = deps.Settings
    local cloneref = deps.cloneref
    local RandomString = deps.RandomString
    local GetCustomAsset = deps.GetCustomAsset

    local CoreGui = cloneref(game:GetService("CoreGui"))
    local UiCornerTable: {{UICorner: UICorner, OriginalRadius: UDim}} = {}

    local function Create(Class, Parent, Properties)
        local inst: any = Instance.new(Class)
        if Properties then
            for k, v in next, Properties do inst[k] = v end
        end
        if Parent then inst.Parent = Parent end
        return inst
    end

    local function CreateCorner(Parent, RadiusScale, RadiusOffset)
        local Corner = Create("UICorner", Parent, {
            CornerRadius = UDim.new(RadiusScale or 0, RadiusOffset or 0)
        })
        UiCornerTable[#UiCornerTable+1] = {
            UICorner = Corner,
            OriginalRadius = UDim.new(RadiusScale or 0, RadiusOffset or 0)
        }
        return Corner
    end

    local function CreateStroke(Parent, Color, ApplyStrokeMode)
        return Create("UIStroke", Parent, {
            Color = Color or Theme.Stroke,
            ApplyStrokeMode = ApplyStrokeMode or Enum.ApplyStrokeMode.Border
        })
    end

    local function CreateAspectRatio(Parent, Ratio)
        return Create("UIAspectRatioConstraint", Parent, { AspectRatio = Ratio })
    end

    local function CreateTween(Object, Properties, Time, EasingStyle)
        return TweenService:Create(
            Object,
            TweenInfo.new(Time or 0.2, EasingStyle or Enum.EasingStyle.Sine),
            Properties
        )
    end

    local U = {}
    U.UiCornerTable = UiCornerTable
    U.Create = Create
    U.CreateCorner = CreateCorner
    U.CreateStroke = CreateStroke
    U.CreateAspectRatio = CreateAspectRatio
    U.CreateTween = CreateTween

    U.UI = Create("ScreenGui", CoreGui, {
        Name = RandomString()
    })

    U.PILL = Create("Frame", U.UI, {
        ZIndex = 0, BorderSizePixel = 0,
        BackgroundColor3 = Theme.Background,
        Size = UDim2.new(0, 218, 0, 71),
        Position = UDim2.new(0.5, -109, 1, -150),
        BorderColor3 = Theme.Background, Name = "Pill",
    })
    CreateCorner(U.PILL, 1, 0)
    CreateStroke(U.PILL, Theme.Stroke)

    local CommandLine = Create("TextBox", U.PILL, {
        CursorPosition = -1, Name = "Cli",
        TextXAlignment = Enum.TextXAlignment.Left,
        PlaceholderColor3 = Theme.TextDim,
        BorderSizePixel = 0, TextWrapped = false, TextSize = 20,
        TextColor3 = Theme.TextMain,
        BackgroundColor3 = Color3.fromRGB(255,255,255),
        FontFace = Theme.Fonts.Regular,
        PlaceholderText = "unexpected",
        Size = UDim2.new(0, 167, 0, 54),
        Position = UDim2.new(0, 25, 0.5, -27),
        BorderColor3 = Theme.Background, Text = "",
        ClearTextOnFocus = false, ZIndex = 2, BackgroundTransparency = 1,
    })
    CommandLine.TextXAlignment = Enum.TextXAlignment.Left
    CommandLine.TextWrapped = false
    CommandLine.ClipsDescendants = true
    U.CommandLine = CommandLine

    U.Predictor = Create("TextLabel", U.PILL, {
        Name = "Predictor", TextXAlignment = Enum.TextXAlignment.Left,
        BorderSizePixel = 0, TextWrapped = false, TextSize = 20,
        TextColor3 = Theme.Stroke,
        BackgroundColor3 = Color3.fromRGB(255,255,255),
        FontFace = Theme.Fonts.Regular,
        Size = UDim2.fromOffset(167, 54),
        Position = UDim2.new(0, 25, 0.5, -27),
        BorderColor3 = Theme.Background, Text = "",
        ZIndex = 1, BackgroundTransparency = 1, ClipsDescendants = true
    })

    U.RecoFrame = Create("ScrollingFrame", U.PILL, {
        Name = "RecoFrame", BackgroundColor3 = Theme.Background,
        BackgroundTransparency = 0, BorderSizePixel = 0,
        Size = UDim2.new(0, 210, 0, 0),
        Position = UDim2.new(0, 25, 0, -5),
        AnchorPoint = Vector2.new(0, 1), Visible = false,
        CanvasSize = UDim2.new(0, 0, 0, 0),
        AutomaticCanvasSize = Enum.AutomaticSize.Y,
        ScrollBarThickness = 1,
        ScrollBarImageColor3 = Theme.Accent,
        ClipsDescendants = true, ZIndex = 0,
    })
    Create("UIListLayout", U.RecoFrame, { SortOrder = Enum.SortOrder.LayoutOrder })
    CreateCorner(U.RecoFrame, 0.1, 0)
    CreateStroke(U.RecoFrame, Theme.Stroke)

    U.Menu = Create("ImageButton", U.PILL, {
        BorderSizePixel = 0, BackgroundTransparency = 1,
        BackgroundColor3 = Color3.fromRGB(255,255,255),
        ImageColor3 = Theme.Accent,
        Image = GetCustomAsset("unexpected_assets/menu.png"),
        Size = UDim2.fromOffset(30, 30),
        BorderColor3 = Theme.Background, Name = "Menu",
        Position = UDim2.fromScale(0.83776, 0.28169),
    })
    CreateAspectRatio(U.Menu)

    U.MenuFrame = Create("Frame", U.PILL, {
        BorderSizePixel = 0, BackgroundColor3 = Theme.Background,
        ClipsDescendants = true, Size = UDim2.fromOffset(339, 348),
        Position = UDim2.new(0.5, -169, 1, -428),
        BorderColor3 = Theme.Background, Name = "MenuFrame", Visible = false,
    })
    CreateCorner(U.MenuFrame, 0.1, 0)
    CreateStroke(U.MenuFrame, Theme.Stroke)

    U.InfoFrame = Create("Frame", U.PILL, {
        BorderSizePixel = 0, BackgroundColor3 = Theme.Background,
        ClipsDescendants = true, Size = UDim2.fromOffset(0, 348),
        Position = UDim2.new(0.5, 175, 0, -357),
        BorderColor3 = Theme.Background, Name = "InfoSideFrame", Visible = false,
    })
    CreateCorner(U.InfoFrame, 0.1, 0)
    CreateStroke(U.InfoFrame, Theme.Stroke)

    U.InfoTitle = Create("TextLabel", U.InfoFrame, {
        Size = UDim2.new(0, 260, 0, 24), Position = UDim2.fromOffset(20, 20),
        BackgroundTransparency = 1, TextColor3 = Theme.TextMain,
        FontFace = Theme.Fonts.Bold, TextSize = 18,
        TextXAlignment = Enum.TextXAlignment.Left, Text = ""
    })
    U.InfoDescScroll = Create("ScrollingFrame", U.InfoFrame, {
        Active = true, BorderSizePixel = 0, CanvasSize = UDim2.new(),
        BackgroundColor3 = Color3.fromRGB(255,255,255), Name = "storeInfoScroll",
        Size = UDim2.new(0, 260, 1, -100),
        ScrollBarImageColor3 = Theme.Accent,
        Position = UDim2.fromOffset(20, 50),
        BorderColor3 = Theme.Background,
        ScrollBarThickness = 1, BackgroundTransparency = 1,
        AutomaticCanvasSize = Enum.AutomaticSize.Y
    })
    Create("UIListLayout", U.InfoDescScroll, { SortOrder = Enum.SortOrder.LayoutOrder })
    U.InfoDescription = Create("TextLabel", U.InfoDescScroll, {
        Size = UDim2.new(1), AutomaticSize = Enum.AutomaticSize.Y,
        BackgroundTransparency = 1, TextColor3 = Theme.TextDim,
        TextYAlignment = Enum.TextYAlignment.Top,
        FontFace = Theme.Fonts.Regular, TextSize = 13,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextWrapped = true, Text = "", RichText = true
    })
    U.InfoAction = Create("TextButton", U.InfoFrame, {
        Size = UDim2.fromOffset(100, 30),
        Position = UDim2.new(0, 20, 1, -45),
        BackgroundColor3 = Theme.Background,
        TextColor3 = Theme.TextMain,
        FontFace = Theme.Fonts.Regular,
        TextSize = 14, BorderSizePixel = 0, Text = "install"
    })
    CreateCorner(U.InfoAction, 0.3, 0)
    CreateStroke(U.InfoAction, Theme.Stroke)

    U.Label = Create("TextLabel", U.MenuFrame, {
        TextWrapped = true, ZIndex = 2, TextSize = 25,
        TextXAlignment = Enum.TextXAlignment.Left,
        BackgroundColor3 = Color3.fromRGB(255,255,255),
        FontFace = Theme.Fonts.Bold, TextColor3 = Theme.TextMain,
        BackgroundTransparency = 1, Size = UDim2.new(0,127,0,19),
        BorderColor3 = Theme.Background, Text = "Menu", Name = "Label",
        Position = UDim2.new(0.0885,0,0.07471,0),
    })

    U.MenuScroll = Create("ScrollingFrame", U.MenuFrame, {
        Name = "MenuScroll", BackgroundTransparency = 1, BorderSizePixel = 0,
        Size = UDim2.fromOffset(300, 230), Position = UDim2.fromOffset(19, 77),
        CanvasSize = UDim2.new(), AutomaticCanvasSize = Enum.AutomaticSize.Y,
        ScrollBarThickness = 1, ScrollBarImageColor3 = Theme.Accent,
        ClipsDescendants = true,
    })
    Create("UIListLayout", U.MenuScroll, {
        SortOrder = Enum.SortOrder.LayoutOrder, Padding = UDim.new(0, 8),
        FillDirection = Enum.FillDirection.Vertical,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Top,
    })
    Create("UIPadding", U.MenuScroll, {
        PaddingTop = UDim.new(0, 1), PaddingBottom = UDim.new(0, 1)
    })

    function U.CreateMenuButton(Name, Text, Order)
        local Button = Create("TextButton", U.MenuScroll, {
            BorderSizePixel = 0, TextSize = 18, TextColor3 = Theme.TextMain,
            BackgroundColor3 = Theme.Background, FontFace = Theme.Fonts.Regular,
            Size = UDim2.new(0, 278, 0, 51), BorderColor3 = Theme.Background,
            Text = Text, Name = Name, Visible = true, LayoutOrder = Order,
        })
        CreateCorner(Button, 0.3, 0)
        CreateStroke(Button, Theme.Stroke)
        return Button
    end

    function U.CreateTab(Name)
        return Create("Frame", U.MenuFrame, {
            BorderSizePixel = 0, BackgroundColor3 = Color3.fromRGB(255,255,255),
            Size = UDim2.new(0,339,0,348), BorderColor3 = Theme.Background,
            Name = Name, BackgroundTransparency = 1, Visible = false,
        })
    end

    function U.CreateTabScroll(Parent, Name)
        return Create("ScrollingFrame", Parent, {
            Active = true, BorderSizePixel = 0, CanvasSize = UDim2.new(),
            BackgroundColor3 = Color3.fromRGB(255,255,255), Name = Name,
            Size = UDim2.fromOffset(278, 210),
            ScrollBarImageColor3 = Theme.Accent,
            Position = UDim2.fromScale(0.0885, 0.32184),
            BorderColor3 = Theme.Background,
            ScrollBarThickness = 1, BackgroundTransparency = 1,
        })
    end

    function U.CreateTabSearch(Parent, Name, Placeholder)
        return Create("TextBox", Parent, {
            CursorPosition = -1, Name = Name,
            PlaceholderColor3 = Theme.TextDim,
            BorderSizePixel = 0, TextSize = 18,
            TextColor3 = Theme.TextMain,
            BackgroundColor3 = Color3.fromRGB(255,255,255),
            FontFace = Theme.Fonts.Regular,
            PlaceholderText = Placeholder,
            Size = UDim2.fromOffset(278, 41),
            Position = UDim2.fromScale(0.0885, 0.17816),
            BorderColor3 = Theme.Background,
            Text = "", BackgroundTransparency = 1,
        })
    end

    function U.CreateTabBack(Parent, Name)
        local b = Create("ImageButton", Parent, {
            BorderSizePixel = 0, BackgroundTransparency = 1,
            BackgroundColor3 = Color3.fromRGB(255,255,255),
            ImageColor3 = Theme.Accent,
            Image = GetCustomAsset("unexpected_assets/back.png"),
            Size = UDim2.fromOffset(38, 30),
            BorderColor3 = Theme.Background,
            Name = Name,
            Position = UDim2.fromScale(0.0885, 0.82759),
        })
        CreateAspectRatio(b)
        return b
    end

    function U.CreateButtonExample(name)
        return Create("TextButton", nil, {
            BorderSizePixel = 0,
            TextXAlignment = Enum.TextXAlignment.Left,
            TextSize = 18, TextColor3 = Theme.TextMain,
            BackgroundColor3 = Theme.Background,
            FontFace = Theme.Fonts.Regular,
            Size = UDim2.fromOffset(278, 33),
            BorderColor3 = Theme.Background,
            Text = "", Name = name, Visible = false,
        })
    end

    local NotifUi = Create("Frame", U.UI, {
        Name = "Notification", BackgroundColor3 = Theme.Background,
        AnchorPoint = Vector2.new(1, 1),
        Position = UDim2.new(1, -12, 1, -12),
        Size = UDim2.new(0, 328, 0, 169), Visible = false,
    })
    CreateCorner(NotifUi, 0.2, 0)
    CreateStroke(NotifUi, Theme.Stroke)
    U.NotifUi = NotifUi

    U.NotifTitleUi = Create("TextLabel", NotifUi, {
        Name = "Title", BackgroundTransparency = 1,
        Position = UDim2.new(0.088,0,0.176,0),
        Size = UDim2.new(0,250,0,25),
        Font = Enum.Font.GothamBold, Text = "Title",
        TextColor3 = Theme.TextMain, TextSize = 25,
        TextXAlignment = Enum.TextXAlignment.Left,
    })
    U.NotifTextUi = Create("TextLabel", NotifUi, {
        Name = "Description", BackgroundTransparency = 1,
        Position = UDim2.new(0.088,0,0.36,0),
        Size = UDim2.new(0,250,0,60),
        Font = Enum.Font.Gotham, Text = "Description",
        TextColor3 = Theme.TextMain, TextSize = 20,
        TextWrapped = true,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextYAlignment = Enum.TextYAlignment.Top,
    })
    U.LoadingBarUi = Create("Frame", NotifUi, {
        Name = "Bar", BackgroundColor3 = Color3.fromRGB(99,99,99),
        Position = UDim2.new(0.09,0,0,0),
        Size = UDim2.new(0.82,0,0,1),
    })
    U.NotifCloseUi = Create("TextButton", NotifUi, {
        Name = "Close", Text = "X",
        TextColor3 = Theme.TextDim, TextSize = 16,
        FontFace = Theme.Fonts.Regular,
        BackgroundTransparency = 1, BorderSizePixel = 0,
        Size = UDim2.new(0, 24, 0, 24),
        Position = UDim2.new(1, -50, 0.7, 8), ZIndex = 2,
    })
    U.NotifCloseUi:SetAttribute("dimText", true)

    function U.ButtonTween(Button, Target)
        local Prop = Button:IsA("ImageButton") and "ImageTransparency" or "TextTransparency"
        CreateTween(Button, { [Prop] = Target }, 0.2, Enum.EasingStyle.Sine):Play()
    end

    local _fadeTargets = setmetatable({}, { __mode = "k" })
    function U.GetFadeTargets(Frame)
        local t = _fadeTargets[Frame]
        if t then return t end
        t = Frame:QueryDescendants("TextLabel,TextButton,TextBox,ImageLabel,ImageButton")
        _fadeTargets[Frame] = t
        return t
    end

    function U.FadeIn(Frame)
        Frame.Visible = true
        for _, c in next, U.GetFadeTargets(Frame) do
            if c:IsA("TextLabel") or c:IsA("TextButton") or c:IsA("TextBox") then
                c.TextTransparency = 1
                CreateTween(c, { TextTransparency = 0 }):Play()
            elseif c:IsA("ImageLabel") or c:IsA("ImageButton") then
                c.ImageTransparency = 1
                CreateTween(c, { ImageTransparency = 0 }):Play()
            end
        end
    end

    function U.FadeOut(Frame)
        for _, c in next, U.GetFadeTargets(Frame) do
            if c:IsA("TextLabel") or c:IsA("TextButton") or c:IsA("TextBox") then
                CreateTween(c, { TextTransparency = 1 }):Play()
            elseif c:IsA("ImageLabel") or c:IsA("ImageButton") then
                CreateTween(c, { ImageTransparency = 1 }):Play()
            end
        end
        task.delay(0.2, function() Frame.Visible = false end)
    end

    function U.UpdateUiCorners(newSize)
        local s = math.clamp(newSize or 1, 0, 1)
        for _, data in next, UiCornerTable do
            local r = data.OriginalRadius
            data.UICorner.CornerRadius = UDim.new(r.Scale * s, r.Offset)
        end
    end

    local Indicator = Create("TextButton", U.UI, {
        Size = UDim2.new(0, 30, 0, 30),
        Position = UDim2.new(0, 20, 1, -70),
        BackgroundColor3 = Theme.Background,
        Visible = false, ZIndex = 20,
        BorderSizePixel = 0, Text = ""
    })
    CreateCorner(Indicator, 1, 0)
    CreateStroke(Indicator, Theme.Stroke)
    CreateAspectRatio(Indicator, 1)
    U.Indicator = Indicator

    U.STSCROLL = Create("ScrollingFrame", nil, {
        Name = "settingsScroll", BackgroundTransparency = 1,
        BorderSizePixel = 0,
        Size = UDim2.fromOffset(300, 230),
        Position = UDim2.fromOffset(19, 77),
        CanvasSize = UDim2.new(),
        AutomaticCanvasSize = Enum.AutomaticSize.Y,
        ScrollBarThickness = 1,
        ScrollBarImageColor3 = Theme.Accent,
        ClipsDescendants = true,
    })
    Create("UIListLayout", U.STSCROLL, {
        SortOrder = Enum.SortOrder.LayoutOrder,
        Padding = UDim.new(0, 6),
        FillDirection = Enum.FillDirection.Vertical,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Top,
    })
    Create("UIPadding", U.STSCROLL, {
        PaddingTop = UDim.new(0, 1), PaddingBottom = UDim.new(0, 1)
    })

    return U
end

return Interface