# Scrutina

> Scrutina - *(latin for "to examine, search, or investigate.")*

This project is a React-based frontend application designed to fetch and display job-related data from a backend API. The app features live status polling, dynamic job listings, and a sleek dark-themed interface.

## Approach and Challenges Faced

The development of Scrutina came with a unique set of challenges due to the stringent anti-bot measures in place on Wellfound. I initially began with Beautiful Soup to scrape the job listings but quickly encountered robust anti-bot mechanisms. These included [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/), which analyzes cursor movements and click timings to ensure human interaction, and a sliding puzzle captcha, which demanded precise manual interactions. Bypassing these measures proved exceptionally challenging, as the system scrutinized cursor movements and timing with remarkable accuracy. Attempts to overcome these barriers using various techniques met with limited success.

Shifting focus, I explored the possibility of using the internal **GraphQL API** calls. However, this method also introduced complications as the API calls were heavily monitored, frequently flagging and suspending accounts, particularly those lacking verification. Additionally, a verified account was required to access key endpoints, adding another layer of complexity. Despite experimenting with multiple scraping tools such as Scrapy and similar frameworks, these methods failed to bypass the security measures effectively.

The breakthrough came when I was poking around with different stuff - utilizing a combination of verified and test accounts. By injecting cookies from a verified account into a Playwright browser session, I was able to authenticate requests. Following this, I logged in with a test account, which circumvented the site's anti-bot mechanisms while maintaining an authentic appearance. This method allowed me to access the right data without triggering security protocols.

While this approach was successful, it could be improved further by implementing cookie rotation and an account rotation system.

## Features

- **Job Status Updates**: Polls the backend periodically for updates on job status.
- **Dynamic UI**: Displays job data, including details like location, role, and more.
- **Error Handling**: Handles cases like missing job data or API errors gracefully.
- **Responsive Design**: Optimized for various screen sizes with a dark-themed interface.
- **Theming**: Consistent dark-themed design using Tailwind CSS.

## Tech Stack

- **Frontend**: React and React Router for dynamic routing.
- **Styling**: Tailwind CSS for rapid and consistent design.
- **HTTP Requests**: Axios for communicating with the backend API.
- **Environment Variables**: Uses `VITE_BACKEND_URL` for API endpoint configuration.

## Setup

### Prerequisites

- Node.js (>= 16)
- npm or yarn package manager
- Backend API endpoint URL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vaishnav-mk/scrutina.git
   cd scrutina
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following:
     ```
     VITE_BACKEND_URL=http://localhost:8000
     ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

5. Open the application in your browser:
   ```
   http://localhost:5173
   ```

## Usage

1. **Navigate to the Job Results page**:
   - Access the page using the route `/job/:jobId`, where `:jobId` is the ID of the job you want to view.

2. **View job status and details**:
   - If the job is still processing, the app will poll the server every 5 seconds for updates.

3. **Browse job listings**:
   - View the list of available jobs, complete with compensation, locations, and links to the job postings.

## Screenshots

![image](https://github.com/user-attachments/assets/154bc891-7db9-492a-b32e-6e186a8f1c56)
![image](https://github.com/user-attachments/assets/04ad0856-25fe-47a1-a1ea-13cdd4199b98)
![image](https://github.com/user-attachments/assets/cbbff2f8-e1f5-4245-a976-2e2c1c136883)

## Future Enhancements

- Implement Redis caching for faster data retrieval.  
- Add automatic cookie updating.  
- Integrate account rotation to handle rate limits.  
- Enable proxy rotation to bypass IP bans.  
- Optimize API request batching for improved performance.  
- Introduce WebSockets for real-time updates instead of polling.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.