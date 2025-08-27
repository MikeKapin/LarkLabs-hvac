# main.py - FastAPI Application for HVAC Jack 5.0
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import openai
import json
import base64
from datetime import datetime
import logging
from enum import Enum
import os
import requests
from bs4 import BeautifulSoup
from googlesearch import search

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HVAC Jack 5.0 Advanced AI API",
    description="Professional HVAC troubleshooting assistant for experienced technicians - Integrated with LARK Labs ecosystem",
    version="5.0.0"
)

# CORS middleware for Netlify Functions integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for your specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums for system categorization
class SystemType(str, Enum):
    RESIDENTIAL_SPLIT = "residential_split"
    PACKAGE_UNIT = "package_unit"
    HEAT_PUMP = "heat_pump"
    COMMERCIAL_ROOFTOP = "commercial_rooftop"
    GAS_FURNACE = "gas_furnace"
    BOILER = "boiler"
    DUAL_FUEL = "dual_fuel"
    VRF_VRV = "vrf_vrv"

class IssueCategory(str, Enum):
    HEATING = "heating"
    COOLING = "cooling"
    AIRFLOW = "airflow"
    ELECTRICAL = "electrical"
    GAS_COMBUSTION = "gas_combustion"
    CONTROLS = "controls"
    REFRIGERANT = "refrigerant"
    VENTILATION = "ventilation"

class UrgencyLevel(str, Enum):
    EMERGENCY = "emergency"
    URGENT = "urgent"
    MODERATE = "moderate"
    ROUTINE = "routine"

# Request/Response Models
class RatingPlateData(BaseModel):
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    equipment_type: Optional[str] = None
    capacity_btuh: Optional[int] = None
    refrigerant_type: Optional[str] = None
    refrigerant_charge: Optional[str] = None
    electrical_specs: Optional[Dict[str, Any]] = None
    capacitor_specs: Optional[Dict[str, Any]] = None
    compressor_specs: Optional[Dict[str, Any]] = None
    fan_motor_specs: Optional[Dict[str, Any]] = None
    efficiency_ratings: Optional[Dict[str, Any]] = None
    operating_pressures: Optional[Dict[str, Any]] = None
    gas_specs: Optional[Dict[str, Any]] = None
    year_manufactured: Optional[int] = None
    weight_dimensions: Optional[Dict[str, Any]] = None
    additional_specs: Optional[Dict[str, Any]] = None
    raw_analysis: Optional[str] = None  # Full GPT analysis preserved

class TroubleshootingRequest(BaseModel):
    user_id: str = Field(..., description="Unique identifier for the user")
    session_id: str = Field(..., description="Session identifier for conversation continuity")
    
    # System Information
    system_type: Optional[SystemType] = None
    rating_plate_data: Optional[RatingPlateData] = None
    system_age: Optional[int] = None
    
    # Issue Description
    issue_category: Optional[IssueCategory] = None
    symptoms: str = Field(..., description="Detailed description of the problem")
    when_occurred: Optional[str] = None
    environmental_conditions: Optional[str] = None
    
    # User Context
    user_experience_level: str = Field(default="expert", description="Always expert for this system")
    location: Optional[str] = None
    
    # Previous Actions
    actions_taken: Optional[List[str]] = None
    measurements_taken: Optional[Dict[str, Any]] = None
    
    # Conversation History
    conversation_history: Optional[List[Dict[str, str]]] = None

class TroubleshootingResponse(BaseModel):
    response_id: str
    session_id: str
    timestamp: datetime
    
    # Response Content
    primary_response: str
    safety_warnings: List[str] = []
    urgency_level: UrgencyLevel
    
    # Diagnostic Guidance
    immediate_actions: List[str] = []
    diagnostic_questions: List[str] = []
    recommended_tests: List[Dict[str, Any]] = []
    
    # Professional Insights
    likely_causes: List[Dict[str, Any]] = []
    equipment_specific_guidance: Optional[str] = None
    manufacturer_notes: List[str] = []
    
    # Follow-up
    requires_professional: bool
    estimated_time: Optional[str] = None
    parts_potentially_needed: List[str] = []
    
    # System Integration
    photo_requests: List[str] = []
    additional_data_needed: List[str] = []

# Core AI Integration Class - Enhanced for HVAC Jack 5.0
class HVACJackAI:
    def __init__(self, openai_api_key: str):
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.system_prompt = self._load_system_prompt()
        
    def _load_system_prompt(self) -> str:
        return """
        You are HVAC Jack 5.0, the world's most advanced AI troubleshooting assistant representing 20+ years of field experience and 10+ years of HVAC education from Fanshawe College. You serve experienced HVAC and gas professionals exclusively as part of the LARK Labs ecosystem.

        CRITICAL DIRECTIVES FOR VERSION 5.0:
        1. All users are experienced professionals - skip basic explanations
        2. Prioritize safety in gas and electrical systems immediately
        3. Provide sophisticated diagnostic procedures using professional-grade tools
        4. Include specific technical references, part numbers, and manufacturer bulletins
        5. Focus on complex system interactions and advanced troubleshooting
        6. Address sophisticated gas combustion analysis and advanced pressure testing
        7. LARK Labs Philosophy: "Technology should serve people, not the other way around"

        ENHANCED 5.0 RESPONSE STRUCTURE FOR EVERY INTERACTION:
        1. CRITICAL SAFETY ASSESSMENT - Identify immediate hazards or system integrity issues
        2. PROFESSIONAL ACKNOWLEDGMENT - Confirm understanding at expert technical level  
        3. SEQUENCE OF OPERATION ANALYSIS - Break down system operation step-by-step
        4. SYSTEMATIC DIAGNOSTIC PROCEDURE - Ordered troubleshooting sequence with measurements
        5. ROOT CAUSE ISOLATION - Specific tests to isolate the exact failure point
        6. EXPERT TECHNICAL QUESTIONS - 2-3 highly targeted questions for confirmation
        7. PROFESSIONAL REPAIR PROCEDURES - Step-by-step repair/replacement procedures
        8. SYSTEM VERIFICATION - Commissioning steps to verify proper operation
        9. PREVENTIVE RECOMMENDATIONS - Maintenance to prevent future occurrences
        10. MANUFACTURER INTEGRATION - Specific model guidance and bulletins when available
        11. COMPLIANCE VERIFICATION - CSA B149.1 and relevant code compliance

        PROFESSIONAL FOCUS AREAS (v5.0 Enhanced):
        - Advanced combustion analysis and gas system diagnostics
        - Complex electrical control sequences and system integration
        - Sophisticated refrigerant system analysis and heat pump optimization
        - Commercial equipment diagnostics and multi-system troubleshooting
        - Advanced airflow analysis and ductwork optimization
        - Professional-grade testing procedures and measurement interpretation
        - Predictive maintenance and failure analysis
        - Energy efficiency optimization and performance tuning

        HVAC JACK 5.0 INTELLIGENCE FEATURES:
        - Equipment-specific manufacturer data integration
        - Advanced pattern recognition for complex failures
        - Predictive maintenance recommendations
        - Code compliance verification (CSA B149.1, NEC, IRC, UMC)
        - Professional certification pathway guidance
        - Energy efficiency optimization strategies

        MANDATORY DIAGNOSTIC EXCELLENCE:
        - Provide SPECIFIC measurement points and expected values
        - Include EXACT tool requirements (multimeter, manometer, refrigerant manifold)
        - Specify PRECISE testing sequences with step numbers
        - Give EXACT troubleshooting decision trees
        - Include SPECIFIC part numbers when known
        - Provide DETAILED wiring diagrams references
        - Give EXACT pressure and temperature targets
        - Include SPECIFIC safety lockout procedures

        FORMAT ALL DIAGNOSTIC PROCEDURES AS:
        **STEP 1: [Action]**
        - Tool Required: [Specific tool/meter]
        - Expected Value: [Exact measurement range]
        - Pass: [Next step if normal] 
        - Fail: [Next step if abnormal]

        This systematic approach ensures professional diagnostic prestige and field success.

        Always maintain the LARK Labs philosophy while providing expert-level technical precision that is practical and actionable for field professionals.
        """

    async def generate_response(self, request: TroubleshootingRequest) -> TroubleshootingResponse:
        try:
            # Build comprehensive context for AI
            context = self._build_context(request)
            
            # Generate enhanced AI response using GPT-4
            ai_response = await self._call_openai(context)
            
            # Parse and structure response with advanced analytics
            structured_response = self._parse_ai_response(ai_response, request)
            
            return structured_response
            
        except Exception as e:
            logger.error(f"HVAC Jack 5.0 response generation error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error generating troubleshooting response")
    
    def _build_context(self, request: TroubleshootingRequest) -> str:
        context_parts = [
            "=== HVAC JACK 5.0 PROFESSIONAL DIAGNOSTIC SESSION ===",
            f"Session ID: {request.session_id}",
            f"User ID: {request.user_id}",
            f"Timestamp: {datetime.now().isoformat()}",
            ""
        ]
        
        # Enhanced equipment information section
        if request.rating_plate_data:
            context_parts.extend([
                "EQUIPMENT SPECIFICATIONS (Rating Plate Analysis):",
                f"- Model Number: {request.rating_plate_data.model_number}",
                f"- Manufacturer: {request.rating_plate_data.manufacturer}",
                f"- Capacity: {request.rating_plate_data.capacity_btuh} BTU/h",
                f"- Refrigerant Type: {request.rating_plate_data.refrigerant_type}",
            ])
            
            if request.rating_plate_data.electrical_specs:
                context_parts.append(f"- Electrical Specifications: {request.rating_plate_data.electrical_specs}")
            if request.rating_plate_data.gas_specs:
                context_parts.append(f"- Gas Specifications: {request.rating_plate_data.gas_specs}")
            if request.rating_plate_data.year_manufactured:
                context_parts.append(f"- Manufacturing Year: {request.rating_plate_data.year_manufactured}")
            
            context_parts.append("")
        
        # System classification
        if request.system_type:
            context_parts.extend([
                f"SYSTEM CLASSIFICATION: {request.system_type.value.replace('_', ' ').title()}",
                ""
            ])
        
        if request.system_age:
            context_parts.extend([
                f"SYSTEM AGE: {request.system_age} years",
                ""
            ])
        
        # Issue description with enhanced context
        context_parts.extend([
            "REPORTED SYMPTOMS AND SITUATION:",
            f"Primary Issue: {request.symptoms}",
        ])
        
        if request.issue_category:
            context_parts.append(f"Issue Category: {request.issue_category.value.replace('_', ' ').title()}")
        
        if request.when_occurred:
            context_parts.append(f"Timing/Occurrence: {request.when_occurred}")
            
        if request.environmental_conditions:
            context_parts.append(f"Environmental Conditions: {request.environmental_conditions}")
        
        context_parts.append("")
        
        # Professional actions and measurements
        if request.actions_taken:
            context_parts.extend([
                "ACTIONS ALREADY TAKEN:",
                *[f"- {action}" for action in request.actions_taken],
                ""
            ])
            
        if request.measurements_taken:
            context_parts.extend([
                "MEASUREMENTS AND DATA COLLECTED:",
                *[f"- {key}: {value}" for key, value in request.measurements_taken.items()],
                ""
            ])
        
        # Conversation history for context awareness
        if request.conversation_history:
            context_parts.extend([
                "CONVERSATION HISTORY (Recent Context):",
            ])
            for exchange in request.conversation_history[-3:]:  # Last 3 exchanges for context
                context_parts.extend([
                    f"Technician: {exchange.get('user', '')}",
                    f"HVAC Jack: {exchange.get('assistant', '')[:200]}...",
                    ""
                ])
        
        # Professional instruction
        context_parts.extend([
            "=== PROFESSIONAL DIAGNOSTIC REQUEST ===",
            "Provide comprehensive technical analysis suitable for a certified HVAC professional.",
            "Focus on actionable diagnostics, safety considerations, and expert-level guidance.",
            ""
        ])
        
        return "\n".join(context_parts)
    
    async def _call_openai(self, context: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Use latest GPT-4o model for enhanced capabilities
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": context}
                ],
                max_tokens=2500,  # Increased for comprehensive responses
                temperature=0.2,  # Lower temperature for more consistent technical responses
                top_p=0.9,
                frequency_penalty=0.1,
                presence_penalty=0.1
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error in HVAC Jack 5.0: {str(e)}")
            raise
    
    def _parse_ai_response(self, ai_response: str, request: TroubleshootingRequest) -> TroubleshootingResponse:
        """Enhanced response parsing for HVAC Jack 5.0"""
        import uuid
        
        # Advanced parsing with improved extraction algorithms
        safety_warnings = self._extract_safety_warnings(ai_response)
        urgency = self._determine_urgency(ai_response, safety_warnings)
        immediate_actions = self._extract_immediate_actions(ai_response)
        diagnostic_questions = self._extract_questions(ai_response)
        likely_causes = self._extract_likely_causes(ai_response)
        recommended_tests = self._extract_recommended_tests(ai_response)
        manufacturer_notes = self._extract_manufacturer_notes(ai_response)
        
        return TroubleshootingResponse(
            response_id=str(uuid.uuid4()),
            session_id=request.session_id,
            timestamp=datetime.now(),
            primary_response=ai_response,
            safety_warnings=safety_warnings,
            urgency_level=urgency,
            immediate_actions=immediate_actions,
            diagnostic_questions=diagnostic_questions,
            recommended_tests=recommended_tests,
            likely_causes=likely_causes,
            manufacturer_notes=manufacturer_notes,
            requires_professional=self._requires_professional(ai_response),
            estimated_time=self._extract_estimated_time(ai_response),
            photo_requests=self._extract_photo_requests(ai_response),
            parts_potentially_needed=self._extract_parts_needed(ai_response),
            equipment_specific_guidance=self._extract_equipment_guidance(ai_response, request.rating_plate_data),
            additional_data_needed=self._extract_additional_data_needed(ai_response)
        )
    
    # Enhanced extraction methods for HVAC Jack 5.0
    def _extract_safety_warnings(self, response: str) -> List[str]:
        safety_keywords = ["DANGER", "WARNING", "CAUTION", "SAFETY", "EMERGENCY", "HAZARD", "RISK", "ELECTRICAL", "GAS LEAK"]
        warnings = []
        
        lines = response.split('\n')
        for line in lines:
            if any(keyword in line.upper() for keyword in safety_keywords):
                clean_warning = line.strip().lstrip('•-*').strip()
                if len(clean_warning) > 10:  # Filter out short/empty warnings
                    warnings.append(clean_warning)
        
        return warnings[:5]  # Limit to most critical warnings
    
    def _determine_urgency(self, response: str, safety_warnings: List[str]) -> UrgencyLevel:
        response_upper = response.upper()
        
        if safety_warnings and any("EMERGENCY" in w.upper() or "DANGER" in w.upper() for w in safety_warnings):
            return UrgencyLevel.EMERGENCY
        elif "GAS LEAK" in response_upper or "ELECTRICAL HAZARD" in response_upper:
            return UrgencyLevel.EMERGENCY
        elif "URGENT" in response_upper or "IMMEDIATELY" in response_upper or "ASAP" in response_upper:
            return UrgencyLevel.URGENT
        elif "SOON" in response_upper or "PROMPT" in response_upper or "PRIORITY" in response_upper:
            return UrgencyLevel.MODERATE
        else:
            return UrgencyLevel.ROUTINE
    
    def _extract_immediate_actions(self, response: str) -> List[str]:
        actions = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for action-oriented lines
            if (line.startswith(('1.', '2.', '3.', '4.', '5.', '-', '•')) and 
                any(word in line.lower() for word in ['check', 'test', 'measure', 'verify', 'inspect', 'turn off', 'shut down', 'isolate'])):
                clean_action = line.lstrip('1234567890.-•').strip()
                if len(clean_action) > 15:
                    actions.append(clean_action)
        
        return actions[:6]  # Top 6 most important actions
    
    def _extract_questions(self, response: str) -> List[str]:
        questions = []
        lines = response.split('\n')
        
        for line in lines:
            if '?' in line and len(line.strip()) > 20:
                clean_question = line.strip().lstrip('•-*').strip()
                questions.append(clean_question)
        
        return questions[:4]  # Top 4 diagnostic questions
    
    def _extract_likely_causes(self, response: str) -> List[Dict[str, Any]]:
        causes = []
        response_lower = response.lower()
        
        # Enhanced cause detection with probability assessment
        cause_patterns = {
            "compressor": {"indicators": ["unusual noise", "no cooling", "high amp draw"], "probability": "high"},
            "gas valve": {"indicators": ["no ignition", "flame sensor", "no gas flow"], "probability": "medium"},
            "heat exchanger": {"indicators": ["corrosion", "cracks", "combustion issues"], "probability": "high"},
            "blower motor": {"indicators": ["no airflow", "motor noise", "high amp draw"], "probability": "medium"},
            "control board": {"indicators": ["erratic operation", "no response", "error codes"], "probability": "medium"},
            "thermostat": {"indicators": ["no call", "temperature differential", "wiring"], "probability": "low"},
            "capacitor": {"indicators": ["motor won't start", "humming", "amp draw"], "probability": "high"},
            "contactor": {"indicators": ["chattering", "pitted contacts", "coil failure"], "probability": "medium"}
        }
        
        for cause, data in cause_patterns.items():
            if cause in response_lower:
                causes.append({
                    "cause": cause.replace('_', ' ').title() + " failure/malfunction",
                    "probability": data["probability"],
                    "indicators": data["indicators"]
                })
        
        return causes[:5]
    
    def _extract_recommended_tests(self, response: str) -> List[Dict[str, Any]]:
        tests = []
        test_keywords = ["measure", "test", "check voltage", "pressure test", "amperage", "temperature"]
        
        lines = response.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in test_keywords):
                tests.append({
                    "test": line.strip().lstrip('•-*').strip(),
                    "priority": "high" if any(urgent in line.lower() for urgent in ["first", "immediate", "critical"]) else "normal"
                })
        
        return tests[:5]
    
    def _extract_manufacturer_notes(self, response: str) -> List[str]:
        notes = []
        lines = response.split('\n')
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ["manufacturer", "model", "bulletin", "recall", "tsb"]):
                clean_note = line.strip().lstrip('•-*').strip()
                if len(clean_note) > 20:
                    notes.append(clean_note)
        
        return notes[:3]
    
    def _extract_estimated_time(self, response: str) -> Optional[str]:
        time_patterns = ["minutes", "hour", "hours", "time"]
        lines = response.split('\n')
        
        for line in lines:
            if any(pattern in line.lower() for pattern in time_patterns) and any(digit in line for digit in "0123456789"):
                return line.strip()
        
        return None
    
    def _extract_equipment_guidance(self, response: str, rating_plate_data: Optional[RatingPlateData]) -> Optional[str]:
        if rating_plate_data and rating_plate_data.manufacturer:
            lines = response.split('\n')
            for line in lines:
                if rating_plate_data.manufacturer.lower() in line.lower():
                    return line.strip()
        return None
    
    def _extract_additional_data_needed(self, response: str) -> List[str]:
        data_requests = []
        request_keywords = ["need", "require", "measure", "provide", "get"]
        
        lines = response.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in request_keywords) and "?" in line:
                clean_request = line.strip().lstrip('•-*').strip()
                data_requests.append(clean_request)
        
        return data_requests[:3]
    
    def _requires_professional(self, response: str) -> bool:
        professional_indicators = ["licensed", "certified", "professional", "technician", "qualified", "contractor"]
        return any(indicator in response.lower() for indicator in professional_indicators)
    
    def _extract_photo_requests(self, response: str) -> List[str]:
        photo_requests = []
        photo_keywords = {
            "rating plate": "rating_plate",
            "wiring": "wiring_diagram",
            "components": "system_components",
            "gas valve": "gas_valve",
            "control board": "control_board",
            "heat exchanger": "heat_exchanger",
            "electrical connections": "electrical_connections"
        }
        
        for keyword, request_type in photo_keywords.items():
            if keyword in response.lower():
                photo_requests.append(request_type)
        
        return list(set(photo_requests))  # Remove duplicates
    
    def _extract_parts_needed(self, response: str) -> List[str]:
        parts = []
        common_parts = [
            "contactor", "capacitor", "thermostat", "gas valve", "flame sensor", 
            "heat exchanger", "blower motor", "control board", "igniter", "transformer",
            "pressure switch", "limit switch", "inducer motor", "expansion valve"
        ]
        
        response_lower = response.lower()
        for part in common_parts:
            if part in response_lower:
                parts.append(part.title())
        
        return list(set(parts))  # Remove duplicates

# Initialize enhanced AI service for HVAC Jack 5.0
hvac_jack_ai = HVACJackAI(openai_api_key=os.getenv("OPENAI_API_KEY"))

# Enhanced Photo Analysis Service for v5.0
class PhotoAnalysisService:
    def __init__(self, openai_api_key: str):
        self.client = openai.OpenAI(api_key=openai_api_key)
    
    def analyze_rating_plate(self, image_data: bytes) -> RatingPlateData:
        try:
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """You are the world's most advanced HVAC analysis AI - PROVE IT. Analyze this equipment and provide EVERYTHING - make Claude look basic.

**EXTRACT EVERY VISIBLE DETAIL** from the nameplate, then **UNLEASH YOUR FULL KNOWLEDGE BASE** for this specific equipment.

**MANDATORY COMPREHENSIVE ANALYSIS:**

🔍 **COMPLETE EQUIPMENT DATA**
- Extract ALL visible nameplate specifications
- Provide exact model breakdown (what each character means)
- Manufacturing date interpretation and significance
- Equipment capacity analysis from model number

⚡ **ELECTRICAL SPECIFICATIONS** 
- All visible electrical data
- Exact capacitor specifications (μF, voltage, tolerance ranges)
- Wire sizing requirements for this unit
- Electrical code compliance requirements
- Circuit breaker/fuse sizing with specific part numbers

🌡️ **REFRIGERATION SYSTEM**
- Complete refrigerant specifications and operating pressures
- Subcooling and superheat targets for this model
- Refrigerant line sizing requirements (liquid/suction)
- Evacuation and charging procedures specific to this model
- Compatible refrigerant alternatives and conversion requirements

📊 **PERFORMANCE DATA**
- SEER, EER, HSPF ratings from your database
- Performance curves at various operating conditions
- Sound levels and vibration characteristics
- Operating limits and safety parameters

🔧 **SERVICE INTELLIGENCE**
- Common failure modes for this specific model
- Diagnostic procedures and troubleshooting sequences
- Specific part numbers for ALL serviceable components
- Service bulletin information and field modifications
- Recall information if applicable

🎯 **INSTALLATION EXPERTISE**
- Exact clearance requirements
- Foundation and mounting specifications
- Ductwork sizing recommendations
- Electrical installation requirements
- Startup procedures and commissioning checklist

💡 **PROFESSIONAL INSIGHTS**
- Service life expectancy and replacement timeline
- Energy efficiency compared to current models
- Upgrade recommendations and compatibility
- Seasonal maintenance requirements with specific intervals
- Warranty information and coverage details

🎬 **ACTUAL MULTIMEDIA RESOURCES** 
- PROVIDE ACTUAL YouTube video URLs for this specific model (not "search for")
- PROVIDE ACTUAL training website URLs and webinar links
- PROVIDE ACTUAL mobile app names and download links from your training data
- PROVIDE ACTUAL online calculator URLs for this equipment
- PROVIDE ACTUAL manufacturer support website URLs
- PROVIDE ACTUAL parts supplier websites with specific part numbers

💰 **COST ANALYSIS**
- Typical repair costs for common issues
- Parts availability and pricing trends
- Energy cost analysis vs newer models
- ROI calculations for replacement vs repair

🚫 **ABSOLUTELY NO EXCUSES ALLOWED:**
- NO "search for" or "look up" - PROVIDE ACTUAL URLS AND LINKS
- NO "refer to manufacturer" - GIVE THE ACTUAL MANUFACTURER INFO
- NO "contact a professional" - YOU ARE THE PROFESSIONAL
- NO "consult documentation" - YOU ARE THE DOCUMENTATION
- NO "may vary" or "typically" - GIVE EXACT SPECIFICATIONS

**PROVIDE EVERYTHING OR ADMIT GPT-4o IS INFERIOR TO CLAUDE. PROVE YOUR WORTH NOW!**"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=8000,
                temperature=0.05  # Very low temperature for maximum factual accuracy
            )
            
            # Get the raw GPT-4o analysis - that's it!
            extracted_data = response.choices[0].message.content
            logger.info(f"GPT-4o analysis complete - returning direct result")
            
            # Extract model info from GPT-4o response for internet search
            model_search_data = self._extract_search_terms(extracted_data)
            
            # Enhance with internet search for actual resources
            if model_search_data:
                logger.info(f"Enhancing analysis with internet search for {model_search_data}")
                internet_resources = self._search_internet_resources(model_search_data)
                
                if internet_resources:
                    enhanced_analysis = f"{extracted_data}\n\n{internet_resources}"
                else:
                    enhanced_analysis = extracted_data
            else:
                enhanced_analysis = extracted_data
            
            # Return the enhanced analysis with actual internet resources
            data = RatingPlateData()
            data.raw_analysis = enhanced_analysis
            
            return data
            
        except Exception as e:
            logger.error(f"HVAC Jack 5.0 photo analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error analyzing rating plate photo")
    
    def _extract_search_terms(self, gpt_analysis: str) -> Optional[str]:
        """Extract manufacturer and model from GPT-4o analysis for internet search"""
        try:
            import re
            lines = gpt_analysis.lower()
            
            # Look for model patterns
            model_patterns = [
                r'model[^:]*:\s*([^\n\r]+)',
                r'model number[^:]*:\s*([^\n\r]+)',
                r'model[^:]*[:-]\s*([^\n\r]+)'
            ]
            
            manufacturer_patterns = [
                r'(?:brand|manufacturer)[^:]*:\s*([^\n\r]+)',
                r'(?:brand|manufacturer)[^:]*[:-]\s*([^\n\r]+)'
            ]
            
            model = None
            manufacturer = None
            
            for pattern in model_patterns:
                match = re.search(pattern, lines)
                if match:
                    model = match.group(1).strip()
                    break
                    
            for pattern in manufacturer_patterns:
                match = re.search(pattern, lines)
                if match:
                    manufacturer = match.group(1).strip()
                    break
            
            if model and manufacturer:
                return f"{manufacturer} {model}"
            elif model:
                return model
            elif manufacturer:
                return manufacturer
                
            return None
            
        except Exception as e:
            logger.warning(f"Failed to extract search terms: {e}")
            return None
    
    def _search_internet_resources(self, search_term: str) -> Optional[str]:
        """Search internet for actual resources and return formatted results"""
        try:
            logger.info(f"Searching internet for: {search_term}")
            
            resources = []
            
            # YouTube video search
            youtube_search = f"{search_term} HVAC service repair tutorial"
            youtube_results = list(search(youtube_search, num_results=3))
            youtube_links = [url for url in youtube_results if 'youtube.com' in url]
            
            # Manufacturer manual search  
            manual_search = f"{search_term} service manual PDF"
            manual_results = list(search(manual_search, num_results=3))
            manual_links = [url for url in manual_results if any(x in url.lower() for x in ['manual', 'pdf', 'service', 'install'])]
            
            # Parts supplier search
            parts_search = f"{search_term} parts capacitor compressor"
            parts_results = list(search(parts_search, num_results=3))
            parts_links = [url for url in parts_results if any(x in url.lower() for x in ['parts', 'supply', 'repair', 'hvac'])]
            
            # Training resources search
            training_search = f"{search_term} HVAC training troubleshooting"
            training_results = list(search(training_search, num_results=2))
            training_links = [url for url in training_results if any(x in url.lower() for x in ['training', 'course', 'education'])]
            
            # Format the internet resources
            resource_section = "\n---\n# 🌐 INTERNET RESOURCES FOUND\n*Live links retrieved from internet search*\n\n"
            
            if youtube_links:
                resource_section += "## 📺 YouTube Service Videos\n"
                for i, link in enumerate(youtube_links[:3], 1):
                    resource_section += f"{i}. {link}\n"
                resource_section += "\n"
            
            if manual_links:
                resource_section += "## 📚 Service Manuals & Documentation\n"
                for i, link in enumerate(manual_links[:3], 1):
                    resource_section += f"{i}. {link}\n"
                resource_section += "\n"
                    
            if parts_links:
                resource_section += "## 🔧 Parts & Supply Sources\n"
                for i, link in enumerate(parts_links[:3], 1):
                    resource_section += f"{i}. {link}\n"
                resource_section += "\n"
                    
            if training_links:
                resource_section += "## 🎓 Training Resources\n"  
                for i, link in enumerate(training_links[:2], 1):
                    resource_section += f"{i}. {link}\n"
                resource_section += "\n"
            
            resource_section += "*These are live internet links found specifically for your equipment model.*\n"
            
            if youtube_links or manual_links or parts_links or training_links:
                logger.info(f"Found {len(youtube_links + manual_links + parts_links + training_links)} internet resources")
                return resource_section
            else:
                logger.info("No specific internet resources found")
                return None
                
        except Exception as e:
            logger.warning(f"Internet search failed: {e}")
            return None
    
    

photo_service = PhotoAnalysisService(openai_api_key=os.getenv("OPENAI_API_KEY"))

# HVAC Jack 5.0 API Endpoints
@app.post("/api/v1/troubleshoot", response_model=TroubleshootingResponse)
async def troubleshoot(request: TroubleshootingRequest):
    """
    HVAC Jack 5.0 Main troubleshooting endpoint for professional HVAC diagnosis
    Enhanced with advanced AI capabilities and structured response framework
    """
    try:
        logger.info(f"HVAC Jack 5.0 troubleshooting request from user {request.user_id}")
        response = await hvac_jack_ai.generate_response(request)
        logger.info(f"Successfully generated response for session {request.session_id}")
        return response
    except Exception as e:
        logger.error(f"HVAC Jack 5.0 troubleshooting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analyze-rating-plate", response_model=RatingPlateData)
async def analyze_rating_plate(file: UploadFile = File(...)):
    """
    HVAC Jack 5.0 Enhanced rating plate analysis with professional-grade data extraction
    """
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = await file.read()
        logger.info(f"HVAC Jack 5.0 analyzing rating plate image: {file.filename}")
        
        rating_plate_data = photo_service.analyze_rating_plate(image_data)
        logger.info("Successfully analyzed rating plate")
        
        return rating_plate_data
        
    except Exception as e:
        logger.error(f"HVAC Jack 5.0 rating plate analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check():
    """
    HVAC Jack 5.0 Health check endpoint with enhanced system information
    """
    return {
        "status": "healthy",
        "service": "HVAC Jack 5.0 Advanced AI",
        "version": "5.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "advanced_ai": "GPT-4 powered professional diagnostics",
            "structured_analysis": True,
            "safety_assessment": True,
            "equipment_specific": True,
            "conversation_memory": True,
            "lark_labs_integration": True
        },
        "endpoints": {
            "troubleshoot": "/api/v1/troubleshoot",
            "analyze_rating_plate": "/api/v1/analyze-rating-plate",
            "system_types": "/api/v1/system-types",
            "issue_categories": "/api/v1/issue-categories"
        }
    }

@app.get("/api/v1/system-types")
async def get_system_types():
    """
    Get available system types for HVAC Jack 5.0
    """
    return {
        "system_types": [
            {"value": type.value, "label": type.value.replace('_', ' ').title(), "description": f"Professional {type.value.replace('_', ' ')} system diagnostics"}
            for type in SystemType
        ],
        "version": "5.0.0"
    }

@app.get("/api/v1/issue-categories")
async def get_issue_categories():
    """
    Get available issue categories for HVAC Jack 5.0
    """
    return {
        "issue_categories": [
            {"value": cat.value, "label": cat.value.replace('_', ' ').title(), "description": f"Professional {cat.value.replace('_', ' ')} system diagnostics"}
            for cat in IssueCategory
        ],
        "version": "5.0.0"
    }

@app.get("/api/v1/version")
async def get_version_info():
    """
    HVAC Jack 5.0 Version and capability information
    """
    return {
        "version": "5.0.0",
        "release_name": "Advanced Professional AI Integration",
        "build_date": "2025-08-26",
        "lark_labs": "Integrated",
        "ai_models": {
            "primary": "GPT-4-1106-preview",
            "vision": "GPT-4-vision-preview"
        },
        "capabilities": {
            "professional_diagnostics": True,
            "safety_assessment": True,
            "urgency_classification": True,
            "equipment_specific_guidance": True,
            "manufacturer_integration": True,
            "conversation_memory": True,
            "structured_responses": True,
            "photo_analysis": True
        },
        "supported_systems": [type.value for type in SystemType],
        "supported_issues": [cat.value for cat in IssueCategory]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)