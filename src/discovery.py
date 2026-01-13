import socket
from zeroconf import ServiceInfo, Zeroconf
import logging

logger = logging.getLogger(__name__)

class ServiceDiscovery:
    def __init__(self, port: int = 8000):
        self.zeroconf = Zeroconf()
        self.port = port
        self.info = None

    def register(self):
        try:
            # Get local IP
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            desc = {'path': '/'}
            
            self.info = ServiceInfo(
                "_fetch-api._tcp.local.",
                "fetch-api._fetch-api._tcp.local.",
                addresses=[socket.inet_aton(local_ip)],
                port=self.port,
                properties=desc,
                server=f"{hostname}.local.",
            )
            
            logger.info(f"Registering service _fetch-api._tcp.local. on {local_ip}:{self.port}")
            self.zeroconf.register_service(self.info)
        except Exception as e:
            logger.error(f"Failed to register service: {e}")

    def unregister(self):
        if self.info:
            logger.info("Unregistering service...")
            self.zeroconf.unregister_service(self.info)
        self.zeroconf.close()
