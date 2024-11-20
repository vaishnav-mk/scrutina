import json
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Query, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError
from dotenv import dotenv_values
from datetime import datetime

config = dotenv_values(".env")
URL = 'https://wellfound.com/'
EMAIL = config.get("EMAIL")
PASSWORD = config.get("PASSWORD")
COOKIES_FILE = 'cookies.json'
JOB_DATA_FILE = 'JobData.json'
SCREENSHOT_DIR = './screenshots/'

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_cookies():
    try:
        with open(COOKIES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Cookies file not found.")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error parsing cookies file.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error loading cookies: {e}")

cookie_data = load_cookies()

def tzdatetosec(tzdate: str) -> int:
    try:
        dt = datetime.fromisoformat(tzdate.replace("Z", "+00:00"))
        return int(dt.timestamp())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error converting date: {e}")

async def init_browser():
    try:
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=False)
        return playwright, browser
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing browser: {e}")

def store_data(data, filename):
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing data to {filename}: {e}")

async def extract_job_data(page: Page):
    try:
        return await page.evaluate("""
            () => {
                const jobCards = Array.from(document.querySelectorAll('.styles_component__uTjje'));
                return jobCards.map(jobCard => ({
                    companyName: jobCard.querySelector('.styles_headerContainer__GfbYF a h2')?.textContent.trim() || 'N/A',
                    companyTagline: jobCard.querySelector('.styles_headerContainer__GfbYF span.text-md')?.textContent.trim() || 'N/A',
                    employeeCount: jobCard.querySelector('.styles_headerContainer__GfbYF span.text-xs')?.textContent.trim() || 'N/A',
                    availableJobs: Array.from(jobCard.querySelectorAll('.styles_component__dBicB .styles_component__Ey28k')).map(job => ({
                        jobName: job.querySelector('.styles_info__h20aa .styles_titleBar__f7F5e .styles_title__xpQDw')?.textContent || 'N/A',
                        link: job.querySelector('.styles_defaultLink__eZMqw.styles_jobLink__US40J')?.getAttribute('href') || 'N/A',
                        compensation: job.querySelector('.styles_info__h20aa .styles_compensation__3JnvU')?.textContent || 'N/A',
                        locations: Array.from(job.querySelectorAll('.styles_info__h20aa .styles_location__O9Z62')).map(loc => loc.textContent),
                        posted: job.querySelector('.styles_tags__c_S1s > span:nth-child(2)')?.textContent || 'N/A'
                    }))
                }));
            }
        """)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting job data: {e}")

async def login(page: Page):
    try:
        await page.goto(URL)
        await page.click('a[href="/login"]')
        await page.wait_for_timeout(2500)
        await page.fill('#user_email', EMAIL)
        await page.fill('#user_password', PASSWORD)
        await page.click('input[type="submit"]')
        await page.wait_for_timeout(2500)
        print("Logged in successfully!")
    except PlaywrightTimeoutError:
        raise HTTPException(status_code=500, detail="Login timeout occurred.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {e}")

async def scroll_page(page: Page, scroll_count: int):
    try:
        for _ in range(scroll_count):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            await page.wait_for_timeout(2500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during page scroll: {e}")

async def has_results(page: Page) -> bool:
    try:
        result_header = await page.query_selector('h4.styles_header__ilUL3')
        if result_header:
            header_text = await result_header.text_content()
            if "0 results" in header_text:
                return False
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking results availability: {e}")

def create_job(details: dict):
    try:
        job_id = str(uuid.uuid4())
        job_data = {"status": "pending", "job_data": None, "created_at": datetime.utcnow().isoformat(), "details": details or {}}

        if os.path.exists(JOB_DATA_FILE):
            with open(JOB_DATA_FILE, 'r') as f:
                job_data_file = json.load(f)
        else:
            job_data_file = {"jobs": {}}

        job_data_file["jobs"][job_id] = job_data

        store_data(job_data_file, JOB_DATA_FILE)

        return job_id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {e}")

@app.on_event("startup")
async def startup():
    try:
        global playwright, browser, page
        playwright, browser = await init_browser()
        page = await browser.new_page()

        cookies = [
            {
                'name': cookie_data['_wellfound']['name'],
                'value': cookie_data['_wellfound']['value'],
                'expires': tzdatetosec(cookie_data['_wellfound']['expires']),
                'path': '/',
                'domain': 'wellfound.com',
            },
            {
                'name': cookie_data['datadome']['name'],
                'value': cookie_data['datadome']['value'],
                'expires': tzdatetosec(cookie_data['datadome']['expires']),
                'domain': '.wellfound.com',
                'path': '/',
            }
        ]
        await page.context.add_cookies(cookies)
        await login(page)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown():
    try:
        if browser:
            await browser.close()
            print("Browser closed.")
        if playwright:
            await playwright.stop()
            print("Playwright stopped.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during shutdown: {e}")

async def scrape_jobs(location: str, role: str, scroll: int, job_id: str):
    try:
        if not page:
            raise HTTPException(status_code=500, detail="Browser is not initialized.")
        
        if page.url != URL:
            await page.goto(URL)
            await page.wait_for_timeout(2500)

        await page.click('li.styles_component__JnTf9[data-test="SavedSearchTab-new"]')
        await page.wait_for_timeout(1000)

        if not await has_results(page):
            return {"error": "No results found."}

        await page.click('.styles_roleWrapper__e5l9z button .styles_label__ikMuI')
        existing_role_values = await page.query_selector_all('.styles_roleWrapper__e5l9z .css-xb97g8.select__multi-value__remove')
        print(f"Removing {len(existing_role_values)} existing role values")
        for value in existing_role_values:
            if value:
                try:
                    await value.click()
                    await page.wait_for_timeout(500)
                except Exception as e:
                    print(f"Failed to remove a role value: {e}")

        await page.keyboard.type(role)
        await page.wait_for_timeout(1500)
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(1000)

        await page.click('.styles_locationWrapper__h5BsW button .flex-row span')
        existing_location_values = await page.query_selector_all('.styles_locationWrapper__h5BsW .css-xb97g8.select__multi-value__remove')
        print(f"Removing {len(existing_location_values)} existing location values")
        for value in existing_location_values:
            if value:
                try:
                    await value.click()
                    await page.wait_for_timeout(500)
                except Exception as e:
                    print(f"Failed to remove a location value: {e}")

        await page.keyboard.type(location)
        await page.wait_for_timeout(1500)
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(1000)

        await scroll_page(page, scroll)

        job_data = await extract_job_data(page)

        if os.path.exists(JOB_DATA_FILE):
            with open(JOB_DATA_FILE, 'r') as f:
                job_data_file = json.load(f)
        else:
            job_data_file = {"jobs": {}}

        job_data_file["jobs"][job_id]["status"] = "completed"
        job_data_file["jobs"][job_id]["job_data"] = job_data
        job_data_file["jobs"][job_id]["completed_at"] = datetime.utcnow().isoformat()

        store_data(job_data_file, JOB_DATA_FILE)

        return {"job_id": job_id, "status": "completed", "job_data": job_data}
    except PlaywrightTimeoutError:
        raise HTTPException(status_code=500, detail="Timeout during scraping.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during scraping: {e}")

@app.post("/scrape")
async def scrape(
    background_tasks: BackgroundTasks,
    location: str = Query(...),
    role: str = Query(...),
    scroll: int = Query(10),
):
    try:
        job_id = create_job(details={"location": location, "role": role, "scroll": scroll})
        background_tasks.add_task(scrape_jobs, location, role, scroll, job_id)
        return JSONResponse(content={"message": "Scraping started.", "job_id": job_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting scrape: {e}")

@app.get("/job/{job_id}")
async def get_job(job_id: str):
    try:
        if not os.path.exists(JOB_DATA_FILE):
            raise HTTPException(status_code=404, detail="No job data found.")

        with open(JOB_DATA_FILE, 'r') as f:
            job_data = json.load(f)

        if job_id not in job_data["jobs"]:
            raise HTTPException(status_code=404, detail="Job ID not found.")

        return JSONResponse(content=job_data["jobs"][job_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving job: {e}")

@app.get("/jobs")
async def get_jobs():
    try:
        if not os.path.exists(JOB_DATA_FILE):
            raise HTTPException(status_code=404, detail="No job data found.")

        with open(JOB_DATA_FILE, 'r') as f:
            job_data = json.load(f)

        job_info = [
            {
                "job_id": job_id,
                "status": job["status"],
                "created_at": job["created_at"],
                "completed_at": job["completed_at"]
            }
            for job_id, job in job_data["jobs"].items()
        ]

        return JSONResponse(content={"jobs": job_info})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving jobs: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
