from browser_use import Agent, Browser, ChatBrowserUse
import asyncio


async def test_login():
    # llm = ChatOllama(model="qwen3-vl:235b-cloud")
    llm = ChatBrowserUse()
    browser = Browser(
        headless=False,  # Show browser window
        window_size={"width": 1000, "height": 700},  # Set window size
    )

    agent = Agent(
        task="""
        1. Go to https://dev-app.tagsamurai.com
        2. Enter email 'user1@qwertysystem.net' and password 'Moderator12@'
        3. Click the login button
        4. Verify you redirected into https://dev-app.tagsamurai.com/modules'
        """,
        llm=llm,
        browser=browser,
    )

    await agent.run()


asyncio.run(test_login())
