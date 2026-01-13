# Mobile Connectivity Diagnostics

If the Expo Go app hangs on "Loading..." or fails to connect, follow these steps to troubleshoot the connection between your Android device and your PC.

## 1. Verify Network Connection
- **Same Wi-Fi**: Ensure your Android phone and your PC are connected to the **exact same Wi-Fi network**.
    - *Note*: If your PC is on Ethernet and phone is on Wi-Fi, they might be on different subnets.
- **IP Address**: Your PC's IP is `192.168.0.70`. Verify your phone has an IP in the same range (e.g., `192.168.0.x`).

## 2. Test Connection from Phone Browser
Open Chrome or any browser on your Android phone and navigate to:
`http://192.168.0.70:8081`

- **If it loads a page** (you should see some text like "Metro Bundler" or raw JSON/HTML):
    - The network connection is good.
    - **Action**: Clear Expo Go cache (Profile > Settings > Clear Cache) and try scanning the QR code again.
- **If it times out or says "Site can't be reached"**:
    - Your phone cannot reach your PC. Proceed to Step 3.

## 3. Check Windows Firewall
Windows Firewall often blocks incoming connections to Node.js/Metro.

1.  Press `Win` key and type "Firewall".
2.  Open **Windows Defender Firewall with Advanced Security**.
3.  Click **Inbound Rules**.
4.  Look for `Node.js JavaScript Runtime` rules.
5.  Ensure they are **Enabled** (Green Checkmark) and allow connection for **Private** networks.
6.  **Quick Test**: Temporarily turn off Windows Firewall (Private Network) to see if it fixes the issue. If it does, re-enable it and add an allow rule for port `8081` and `8000`.

## 4. Manual Connection
Sometimes the QR code data is slightly off. Try connecting manually in Expo Go:

1.  Open Expo Go.
2.  Tap "Enter URL manually".
3.  Type: `exp://192.168.0.70:8081`
4.  Tap Connect.

## 5. Tunnel Connection (Last Resort)
If local connection fails due to router isolation (common in offices/cafes), use a Tunnel.
*Note: This is slower but bypasses local network issues.*

1.  Stop the current server (`Ctrl+C`).
2.  Run: `npx expo start --clear --tunnel`
3.  Scan the new QR code.
