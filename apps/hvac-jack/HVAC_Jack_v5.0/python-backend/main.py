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
        3. ADVANCED DIAGNOSTIC ANALYSIS - Sophisticated troubleshooting without basic explanations
        4. EXPERT TECHNICAL QUESTIONS - 2-3 highly targeted questions for root cause analysis
        5. PROFESSIONAL SOLUTIONS - Advanced procedures requiring professional expertise
        6. SYSTEM OPTIMIZATION - Performance enhancement and efficiency opportunities
        7. MANUFACTURER INTEGRATION - Specific model guidance and bulletins when available
        8. COMPLIANCE VERIFICATION - CSA B149.1 and relevant code compliance

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
    
    async def analyze_rating_plate(self, image_data: bytes) -> RatingPlateData:
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
                                "text": """HVAC Jack 5.0 Comprehensive Professional Equipment Analysis

Analyze this HVAC equipment photo with professional precision and extract all technical specifications and operational data for certified technicians.

## 🔍 EQUIPMENT IDENTIFICATION & SPECIFICATIONS
- Model Number (exact alphanumeric sequence)
- Serial Number (complete sequence)  
- Manufacturer/Brand Name
- Manufacturing Year or Date Code
- Equipment Type (heat pump, A/C, furnace, etc.)

## ⚡ ELECTRICAL & CAPACITY DATA
- Capacity in BTU/h (cooling and heating if different)
- Electrical Specifications (voltage, amperage, phase, frequency, watts)
- Compressor specifications (RLA, LRA, motor type)
- Fan motor specifications (voltage, amperage, RPM, capacitor ratings)
- Capacitor ratings (μF, voltage rating - dual/single capacitor specs)

## 🌡️ REFRIGERANT & GAS DATA
- Refrigerant Type (R-410A, R-22, R-32, etc.)
- Refrigerant Charge Amount (ounces, pounds, or kg)
- Operating pressures (high/low side pressures)
- Gas Specifications if present (input BTU/h, manifold pressure, gas type)

## 📊 PERFORMANCE & EFFICIENCY
- Efficiency Ratings (SEER, AFUE, HSPF, EER, COP)
- Performance data at rated conditions
- Sound levels if listed
- Weight and dimensions

## 🔧 TECHNICAL DETAILS & CONDITION
- Additional component specifications visible
- Installation requirements or notes
- Refrigerant line sizes
- Physical condition observations
- Any safety warnings or certifications visible

Provide comprehensive, structured data with exact values. If any specification is unclear, indicate "Unclear" rather than guessing."""
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
                max_tokens=2000,
                temperature=0.15  # Low temperature for accurate but comprehensive analysis
            )
            
            extracted_data = response.choices[0].message.content
            logger.info(f"Raw GPT-4o analysis response: {extracted_data}")
            
            parsed_data = self._parse_rating_plate_data(extracted_data)
            logger.info(f"Parsed data fields: {[k for k, v in parsed_data.dict().items() if v is not None]}")
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"HVAC Jack 5.0 photo analysis error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error analyzing rating plate photo")
    
    def _parse_rating_plate_data(self, extracted_text: str) -> RatingPlateData:
        """Enhanced parsing for HVAC Jack 5.0 with comprehensive data extraction"""
        import re
        
        data = RatingPlateData()
        data.raw_analysis = extracted_text  # Preserve full analysis
        
        lines = extracted_text.split('\n')
        data.electrical_specs = {}
        data.capacitor_specs = {}
        data.compressor_specs = {}
        data.fan_motor_specs = {}
        data.efficiency_ratings = {}
        data.operating_pressures = {}
        data.additional_specs = {}
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Basic identification - more flexible matching
            if ('model' in line_lower or 'model#' in line_lower or 'model number' in line_lower) and (':' in line or '-' in line):
                separator = ':' if ':' in line else '-'
                parts = line.split(separator, 1)
                if len(parts) > 1:
                    data.model_number = parts[1].strip()
            elif ('serial' in line_lower or 'serial#' in line_lower or 'serial number' in line_lower) and (':' in line or '-' in line):
                separator = ':' if ':' in line else '-'
                parts = line.split(separator, 1)
                if len(parts) > 1:
                    data.serial_number = parts[1].strip()
            elif any(word in line_lower for word in ['manufacturer', 'brand', 'make']) and (':' in line or '-' in line):
                separator = ':' if ':' in line else '-'
                parts = line.split(separator, 1)
                if len(parts) > 1:
                    data.manufacturer = parts[1].strip()
            elif ('equipment type' in line_lower or 'type:' in line_lower or 'unit type' in line_lower):
                if ':' in line or '-' in line:
                    separator = ':' if ':' in line else '-'
                    parts = line.split(separator, 1)
                    if len(parts) > 1:
                        data.equipment_type = parts[1].strip()
                
            # Capacity and refrigerant
            elif 'capacity' in line_lower and 'btu' in line_lower:
                btu_match = re.search(r'(\d+,?\d*)\s*btu', line_lower)
                if btu_match:
                    data.capacity_btuh = int(btu_match.group(1).replace(',', ''))
            elif ('refrigerant' in line_lower and ('r-' in line_lower or 'r410' in line_lower or 'r22' in line_lower or 'r32' in line_lower)):
                # Extract refrigerant type from the line
                ref_match = re.search(r'(r-?\d+[a-z]*)', line_lower)
                if ref_match:
                    data.refrigerant_type = ref_match.group(1).upper()
                elif ':' in line:
                    data.refrigerant_type = line.split(':', 1)[1].strip()
            elif 'charge' in line_lower and ('oz' in line_lower or 'lb' in line_lower or 'kg' in line_lower):
                data.refrigerant_charge = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                
            # Electrical specifications
            elif any(word in line_lower for word in ['voltage', 'volts', 'amperage', 'amps', 'watts', 'phase', 'frequency']) and ':' in line:
                key = line.split(':')[0].strip()
                value = line.split(':', 1)[1].strip()
                data.electrical_specs[key] = value
                
            # Capacitor specifications  
            elif 'capacitor' in line_lower and ('μf' in line_lower or 'uf' in line_lower or 'mfd' in line_lower):
                key = line.split(':')[0].strip() if ':' in line else 'Capacitor'
                value = line.split(':', 1)[1].strip() if ':' in line else line.strip()
                data.capacitor_specs[key] = value
                
            # Compressor specs
            elif any(word in line_lower for word in ['rla', 'lra', 'compressor']) and ':' in line:
                key = line.split(':')[0].strip()
                value = line.split(':', 1)[1].strip()
                data.compressor_specs[key] = value
                
            # Efficiency ratings
            elif any(word in line_lower for word in ['seer', 'afue', 'hspf', 'eer', 'cop']) and ':' in line:
                key = line.split(':')[0].strip()
                value = line.split(':', 1)[1].strip()
                data.efficiency_ratings[key] = value
                
            # Operating pressures
            elif 'pressure' in line_lower and ':' in line:
                key = line.split(':')[0].strip()
                value = line.split(':', 1)[1].strip()
                data.operating_pressures[key] = value
                
            # Year
            elif 'year' in line_lower or 'date' in line_lower:
                year_match = re.search(r'(20\d{2}|19\d{2})', line)
                if year_match:
                    data.year_manufactured = int(year_match.group(1))
                    
            # Catch additional specifications
            elif ':' in line and line.strip():
                key = line.split(':')[0].strip()
                value = line.split(':', 1)[1].strip()
                if value and not any(d and key in d for d in [data.electrical_specs, data.capacitor_specs, data.compressor_specs, data.efficiency_ratings]):
                    data.additional_specs[key] = value
        
        return data

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
        
        rating_plate_data = await photo_service.analyze_rating_plate(image_data)
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