# Migrating to Modular Caddy Configuration

## Current Setup
Your current `/etc/caddy/Caddyfile` contains all sites in one file.

## Migration Steps

### 1. Backup Current Configuration
```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup
```

### 2. Create Sites Directory
```bash
sudo mkdir -p /etc/caddy/sites
sudo chown caddy:caddy /etc/caddy/sites
```

### 3. Split Site Configurations

Create `/etc/caddy/sites/greyhunter.com.pl`:
```caddy
greyhunter.com.pl {
	redir / https://www.greyhunter.com.pl{uri}
}

www.greyhunter.com.pl {
	root * /home/tomjan/sites/greyhunter.com.pl
	file_server
	
	# Add cache headers
	@html {
		path *.html /
	}
	header @html {
		Cache-Control "public, max-age=3600, must-revalidate"
	}
	
	encode gzip zstd
}
```

Create `/etc/caddy/sites/eley.com.pl`:
```bash
# This will be automatically deployed from the eley repo
# Initial setup:
sudo touch /etc/caddy/sites/eley.com.pl
sudo chown caddy:caddy /etc/caddy/sites/eley.com.pl
```

### 4. Update Main Caddyfile

Replace `/etc/caddy/Caddyfile` with:
```caddy
{
	email tomasz@szpak.dev

	log {
		output file /var/log/caddy/caddy_error.log
		level ERROR
	}
}

# Import all site-specific configurations
import /etc/caddy/sites/*
```

### 5. Validate Configuration
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

### 6. Reload Caddy
```bash
sudo systemctl reload caddy
```

### 7. Verify Sites
```bash
# Check all sites are loading
curl -I https://eley.com.pl
curl -I https://www.greyhunter.com.pl
curl -I https://greyhunter.com.pl  # Should redirect
```

## Benefits

✅ **Automatic deployment**: eley.com.pl config updates with each deployment
✅ **Version control**: Each site's config is versioned in its repo
✅ **Isolated changes**: Updating one site doesn't affect others
✅ **Easy management**: Add/remove sites by adding/removing files
✅ **No downtime**: Changes only affect the specific site

## Directory Structure

```
/etc/caddy/
├── Caddyfile                    # Main config with global settings
└── sites/                       # Site-specific configs
    ├── eley.com.pl             # Auto-deployed from eley repo
    ├── greyhunter.com.pl       # Manually managed or auto-deployed
    └── sarsilmaz.pl            # Manually managed or auto-deployed
```

## Rollback

If something goes wrong:
```bash
sudo cp /etc/caddy/Caddyfile.backup /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Future Sites

For sarsilmaz.pl or any new site:
1. Create the site config in `/etc/caddy/sites/sarsilmaz.pl`
2. Caddy automatically loads it on next reload
3. Optionally: Set up automatic deployment like eley.com.pl
