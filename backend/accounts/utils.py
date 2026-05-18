def parse_device_hint(user_agent: str) -> str:
    ua = user_agent.lower()

    if "iphone" in ua:       device = "iPhone"
    elif "ipad" in ua:       device = "iPad"
    elif "android" in ua:    device = "Android"
    elif "macintosh" in ua:  device = "Mac"
    elif "windows" in ua:    device = "Windows"
    elif "linux" in ua:      device = "Linux"
    else:                    device = "Unknown device"

    if "chrome" in ua and "edg" not in ua:  browser = "Chrome"
    elif "firefox" in ua:                    browser = "Firefox"
    elif "safari" in ua and "chrome" not in ua: browser = "Safari"
    elif "edg" in ua:                        browser = "Edge"
    else:                                    browser = "Browser"

    return f"{browser} on {device}"