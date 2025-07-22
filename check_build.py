#!/usr/bin/env python3
"""
Moodly Build Error Checker
Checks for common build issues before running npm build
"""

import os
import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

class BuildErrorChecker:
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.errors = []
        self.warnings = []
        
    def check_all(self) -> Tuple[List[str], List[str]]:
        """Run all checks and return errors and warnings"""
        print("🔍 Checking for build errors in Moodly project...")
        
        # Core checks
        self.check_package_json()
        self.check_typescript_config()
        self.check_import_paths()
        self.check_missing_files()
        self.check_dependency_imports()
        self.check_lucide_icons()
        self.check_tailwind_config()
        
        return self.errors, self.warnings
    
    def check_package_json(self):
        """Check package.json for missing dependencies"""
        print("📦 Checking package.json...")
        
        package_path = self.project_root / "package.json"
        if not package_path.exists():
            self.errors.append("❌ package.json not found")
            return
            
        try:
            with open(package_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
        except json.JSONDecodeError:
            self.errors.append("❌ package.json is not valid JSON")
            return
            
        dependencies = package_data.get('dependencies', {})
        dev_dependencies = package_data.get('devDependencies', {})
        all_deps = {**dependencies, **dev_dependencies}
        
        # Required dependencies for your Moodly project
        required_deps = {
            'react': 'React framework',
            'react-dom': 'React DOM',
            'react-router-dom': 'React routing',
            '@tanstack/react-query': 'Data fetching',
            'zustand': 'State management',
            'lucide-react': 'Icons',
            'tailwindcss': 'CSS framework',
            'vite': 'Build tool',
            '@vitejs/plugin-react': 'Vite React plugin',
            'typescript': 'TypeScript compiler',
            '@radix-ui/react-slot': 'Radix UI',
            '@radix-ui/react-toast': 'Toast notifications',
            'class-variance-authority': 'Styling utilities',
            'clsx': 'Conditional classes',
            'tailwind-merge': 'Tailwind utilities',
            'tailwindcss-animate': 'Tailwind animations'
        }
        
        missing_deps = []
        for dep, description in required_deps.items():
            if dep not in all_deps:
                missing_deps.append(f"  • {dep} ({description})")
        
        if missing_deps:
            self.errors.append(f"❌ Missing dependencies:\n" + "\n".join(missing_deps))
        else:
            print("  ✅ All required dependencies found")
    
    def check_typescript_config(self):
        """Check TypeScript configuration"""
        print("🔧 Checking TypeScript config...")
        
        tsconfig_path = self.project_root / "tsconfig.json"
        if not tsconfig_path.exists():
            self.warnings.append("⚠️ tsconfig.json not found")
            return
            
        try:
            with open(tsconfig_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Remove comments for JSON parsing
                content = re.sub(r'//.*', '', content)
                tsconfig = json.loads(content)
        except (json.JSONDecodeError, Exception) as e:
            self.errors.append(f"❌ tsconfig.json parsing error: {e}")
            return
            
        compiler_options = tsconfig.get('compilerOptions', {})
        
        # Check for problematic settings
        if compiler_options.get('noEmit') != True:
            self.warnings.append("⚠️ Consider setting 'noEmit': true in tsconfig.json")
            
        if 'references' in tsconfig:
            self.warnings.append("⚠️ Project references found - ensure all referenced files exist")
            
        print("  ✅ TypeScript config looks good")
    
    def check_import_paths(self):
        """Check for incorrect import paths"""
        print("📁 Checking import paths...")
        
        src_dir = self.project_root / "src"
        if not src_dir.exists():
            self.errors.append("❌ src directory not found")
            return
            
        issues = []
        
        # Common problematic import patterns
        problematic_patterns = [
            (r"from ['\"]@/store/", "Should be '@/stores/' (plural)"),
            (r"from ['\"]@/component/", "Should be '@/components/' (plural)"),
            (r"from ['\"]@/page/", "Should be '@/pages/' (plural)"),
            (r"from ['\"]\.\.\/\.\.\/\.\./", "Too many relative imports, consider absolute imports"),
        ]
        
        for file_path in src_dir.rglob("*.tsx"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for pattern, message in problematic_patterns:
                    if re.search(pattern, content):
                        issues.append(f"  • {file_path.relative_to(self.project_root)}: {message}")
            except Exception as e:
                self.warnings.append(f"⚠️ Could not read {file_path}: {e}")
        
        if issues:
            self.errors.append(f"❌ Import path issues:\n" + "\n".join(issues))
        else:
            print("  ✅ Import paths look good")
    
    def check_missing_files(self):
        """Check for missing critical files"""
        print("📄 Checking for missing files...")
        
        required_files = [
            ("src/main.tsx", "Entry point"),
            ("src/App.tsx", "Main App component"),
            ("src/index.css", "Main CSS file"),
            ("index.html", "HTML template"),
            ("vite.config.ts", "Vite configuration"),
        ]
        
        missing = []
        for file_path, description in required_files:
            if not (self.project_root / file_path).exists():
                missing.append(f"  • {file_path} ({description})")
        
        if missing:
            self.errors.append(f"❌ Missing critical files:\n" + "\n".join(missing))
        else:
            print("  ✅ All critical files found")
    
    def check_dependency_imports(self):
        """Check for imports that don't match installed dependencies"""
        print("🔗 Checking dependency imports...")
        
        # Read package.json to get installed dependencies
        package_path = self.project_root / "package.json"
        if not package_path.exists():
            return
            
        try:
            with open(package_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            dependencies = package_data.get('dependencies', {})
            dev_dependencies = package_data.get('devDependencies', {})
            all_deps = {**dependencies, **dev_dependencies}
        except:
            return
        
        src_dir = self.project_root / "src"
        if not src_dir.exists():
            return
            
        import_issues = []
        
        for file_path in src_dir.rglob("*.tsx"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Find all imports
                imports = re.findall(r"from ['\"]([^'\"]+)['\"]", content)
                
                for imp in imports:
                    if imp.startswith('@') and not imp.startswith('@/'):
                        # External dependency
                        package_name = imp.split('/')[0] + '/' + imp.split('/')[1] if imp.count('/') > 0 and imp.startswith('@') else imp.split('/')[0]
                        
                        if package_name not in all_deps:
                            import_issues.append(f"  • {file_path.relative_to(self.project_root)}: imports '{imp}' but '{package_name}' not in dependencies")
            except Exception:
                continue
        
        if import_issues:
            self.errors.append(f"❌ Dependency import issues:\n" + "\n".join(import_issues))
        else:
            print("  ✅ Dependency imports look good")
    
    def check_lucide_icons(self):
        """Check for non-existent Lucide React icons"""
        print("🎨 Checking Lucide icons...")
        
        # Common non-existent icons that cause build errors
        non_existent_icons = [
            'BookmarkCheck',  # Should be BookmarkPlus or Check
            'MenuIcon',       # Should be Menu
            'CrossIcon',      # Should be X
            'TickIcon',       # Should be Check
        ]
        
        src_dir = self.project_root / "src"
        if not src_dir.exists():
            return
            
        icon_issues = []
        
        for file_path in src_dir.rglob("*.tsx"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                for icon in non_existent_icons:
                    if icon in content:
                        icon_issues.append(f"  • {file_path.relative_to(self.project_root)}: uses non-existent icon '{icon}'")
            except Exception:
                continue
        
        if icon_issues:
            self.errors.append(f"❌ Lucide icon issues:\n" + "\n".join(icon_issues))
        else:
            print("  ✅ Lucide icons look good")
    
    def check_tailwind_config(self):
        """Check Tailwind configuration"""
        print("🎨 Checking Tailwind config...")
        
        tailwind_configs = ['tailwind.config.ts', 'tailwind.config.js']
        config_found = False
        
        for config_name in tailwind_configs:
            config_path = self.project_root / config_name
            if config_path.exists():
                config_found = True
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Check for problematic configurations
                    if 'tailwindcss-animate' in content and 'require(' in content:
                        # Check if it's wrapped in try-catch
                        if 'try' not in content or 'catch' not in content:
                            self.warnings.append("⚠️ Consider wrapping tailwindcss-animate require in try-catch")
                            
                except Exception as e:
                    self.warnings.append(f"⚠️ Could not read {config_name}: {e}")
                break
        
        if not config_found:
            self.warnings.append("⚠️ No Tailwind config found")
        else:
            print("  ✅ Tailwind config found")

def main():
    """Main function to run all checks"""
    checker = BuildErrorChecker()
    errors, warnings = checker.check_all()
    
    print("\n" + "="*50)
    print("📋 BUILD CHECK RESULTS")
    print("="*50)
    
    if errors:
        print(f"\n🚨 ERRORS FOUND ({len(errors)}):")
        for error in errors:
            print(f"\n{error}")
    
    if warnings:
        print(f"\n⚠️ WARNINGS ({len(warnings)}):")
        for warning in warnings:
            print(f"\n{warning}")
    
    if not errors and not warnings:
        print("\n✅ ALL CHECKS PASSED!")
        print("Your project should build successfully!")
    elif not errors:
        print(f"\n✅ NO CRITICAL ERRORS FOUND!")
        print("Your project should build, but consider addressing warnings.")
    else:
        print(f"\n❌ FOUND {len(errors)} CRITICAL ERRORS")
        print("Fix these issues before building.")
    
    print("\n" + "="*50)
    
    # Exit with error code if critical errors found
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()