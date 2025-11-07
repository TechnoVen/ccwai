# CHANGELOG

## [0.3.0] – 2025-11-07
### Added
- Multi-provider support: OpenAI, Gemini, DeepSeek
- Adapter architecture & failover
- YAML front-matter commands
- Agent persona system
- CLI commands: list, doctor, init stub
- Project-root discovery
- Thought-storage pipeline
- Updated README with usage

### Changed
- Refactored core + cli into independent packages under workspaces
- Moved command templates into `/commands` folder
- Changed binary mapping in `cli/package.json`
- Removed path alias in favor of direct module import
- Config file uses JSON and supports multiple providers

### Fixed
- Permission / global linking issues for ccwai binary
- Environment variable loading for API keys
- Command not found bug due to wrong working directory

### Removed
- Legacy workspace aliasing from v0.2.x
