-- --------------------------------------------------------
-- Host:                         193.203.175.251
-- Versión del servidor:         11.8.3-MariaDB-log - MariaDB Server
-- SO del servidor:              Linux
-- HeidiSQL Versión:             12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando datos para la tabla u330129056_picaje.activities: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.agent_actions_log: ~149 rows (aproximadamente)
INSERT IGNORE INTO `agent_actions_log` (`id`, `session_id`, `phone`, `action_type`, `intent`, `entities_json`, `request_text`, `response_text`, `llm_raw_response`, `duration_ms`, `success`, `error_message`, `created_at`) VALUES
	(1, 1, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola Paul WR🤘🏻! 👋\n\nBienvenido al Taller Automotriz.\n\n¿En qué puedo ayudarte?\n• 💰 Cotizar servicio\n• 📅 Agendar cita\n• 👨‍🔧 Hablar con asesor', NULL, NULL, NULL, NULL, NULL),
	(2, 1, NULL, 'HUMAN', NULL, NULL, 'Quiero actualizar mis datos', '👨‍🔧 Te comunico con un asesor. Espera ~5 min o llama: +51 999 888 777', NULL, NULL, NULL, NULL, NULL),
	(3, 1, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola! 👋 Bienvenido al Taller Automotriz.\n\nVeo que es tu primera vez aquí. Para darte un mejor servicio, ¿podrías decirme tu nombre completo?\n\nO si prefieres:\n• 💰 Cotizar servicio\n• 📅 Agendar cita\n', NULL, NULL, NULL, NULL, NULL),
	(4, 1, NULL, 'REGISTER_CLIENT', NULL, NULL, 'Me llamo Paul', '✅ Te he registrado correctamente, Paul.\n\n¿Deseas agregar un vehículo ahora? Indícame marca, modelo y año.', NULL, NULL, NULL, NULL, NULL),
	(5, 1, NULL, 'ADD_VEHICLE', NULL, NULL, 'Si, mi vehículo es un Toyota Hilux 4x4 del año 2000', '✅ He registrado tu vehículo:\n\n🚗 Toyota Hilux 4x4 2000\n\n¿Deseas cotizar algún servicio para este vehículo?', NULL, NULL, NULL, NULL, NULL),
	(6, 1, NULL, 'ASK_SERVICE_INFO', NULL, NULL, 'Que servicios tiene', '🔧 *SERVICIOS DISPONIBLES*\n\n\n¿Cuál te interesa? Te doy más detalles.', NULL, NULL, NULL, NULL, NULL),
	(7, 1, NULL, 'UPDATE_VEHICLE', NULL, NULL, 'Quiero actualizar la información de mi vehículo', 'Tienes registrado: *null null*\n\n¿Qué dato deseas modificar?\n• Placa\n• Kilometraje\n• Año', NULL, NULL, NULL, NULL, NULL),
	(8, 1, NULL, 'FALLBACK', NULL, NULL, 'Hola', 'Disculpe, no he comprendido su consulta.\n\n¿En qué puedo asistirle?\n• 💰 Cotización de servicios\n• 📅 Agendar cita\n• 🚗 Registrar vehículo\n• 📋 Ver mis datos\n• ❓ Consultas técnicas sobre repuestos\n• 👨‍🔧 Hablar con un asesor', NULL, NULL, NULL, NULL, NULL),
	(9, 1, NULL, 'VIEW_MY_DATA', NULL, NULL, 'Quiero ver mis datos', '📋 *DATOS REGISTRADOS EN NUESTRO SISTEMA*\n\n👤 *Información Personal:*\n   Nombre: Paul\n   Apellido: -\n   Teléfono: 51912528990\n   Cliente desde: 17/2/2026\n\n🚗 *Vehículos Registrados (1):*\n\n   1.   2000\n\n¿Desea actualizar alguno de estos datos?', NULL, NULL, NULL, NULL, NULL),
	(10, 1, NULL, 'UPDATE_VEHICLE', NULL, NULL, 'Si quiero actualizar los datos de mi vehículo', 'Tiene registrado: *null null* 2000\n\n¿Qué dato desea actualizar?\n• Placa\n• Kilometraje\n• Color', NULL, NULL, NULL, NULL, NULL),
	(11, 1, NULL, 'UPDATE_VEHICLE', NULL, NULL, 'Quiero actualizar la marca y el modelo', 'Tiene registrado: *null null* 2000\n\n¿Qué dato desea actualizar?\n• Placa\n• Kilometraje\n• Color', NULL, NULL, NULL, NULL, NULL),
	(12, 1, NULL, 'GREETING', NULL, NULL, 'Hola', 'Buenos días, Paul. Es un gusto saludarle.\n\n¿En qué puedo ayudarle?', NULL, NULL, NULL, NULL, '2026-02-18 00:27:06'),
	(13, 1, NULL, 'UPDATE_CLIENT', NULL, NULL, 'Quiero actualizar mis datos', '¿Qué dato personal desea actualizar?\n\n• Nombre\n• Apellido\n• Email\n• Documento (DNI/RUC)\n• Empresa\n\nEscriba: "actualizar [campo] a [valor]"', NULL, NULL, NULL, NULL, '2026-02-18 00:27:35'),
	(14, 1, NULL, 'VIEW_MY_DATA', NULL, NULL, 'Antes quisiera ver los datos actuales que tengo para ver cuáles están por corregir', '📋 *SUS DATOS REGISTRADOS*\n━━━━━━━━━━━━━━━━\n\n👤 *INFORMACIÓN PERSONAL:* Nombre: Paul Apellido: ⚠️ No registrado Teléfono: 51912528990 Email: ⚠️ No registrado Tipo Doc: ⚠️ No registrado Documento: ⚠️ No registrado Empresa: ⚠️ No registrada Cliente desde: 17/2/2026\n\n🚗 *VEHÍCULOS (0):* (Sin vehículos registrados)\n\n━━━━━━━━━━━━━━━━\n💡 *Para actualizar escriba:*\n• "actualizar mi email a ejemplo@mail.com"\n• "cambiar marca del vehículo a Toyota"\n• "actualizar placa a ABC-123"\n• "mi VIN es 1HGBH41JXMN1', NULL, NULL, NULL, NULL, '2026-02-18 00:28:27'),
	(15, 1, NULL, 'REGISTER_CLIENT', NULL, NULL, 'mi email es poolrf@mail.com\nMi carro es un Toyota Hilux 4x4 del año 2000, la placa es BIM-123"\nmi VIN es 1HGBH41JZYU209486', '✅ Registrado: Paul\n\n¿Desea agregar un vehículo?', NULL, NULL, NULL, NULL, '2026-02-18 00:31:40'),
	(16, 1, NULL, 'ADD_VEHICLE', NULL, NULL, 'Si es el que te dije\nMi carro es un Toyota Hilux 4x4 del año 2000, la placa es BIM-123"\nmi VIN es 1HGBH41JZYU209486', '✅ Vehículo registrado:\n\n🚗 *Toyota Hilux 4x4 2000* 📋 Placa: BIM-123 🔑 VIN: 1HGBH41JZYU209486\n\n💡 Puede agregar más datos luego con "actualizar placa", "VIN", etc.', NULL, NULL, NULL, NULL, '2026-02-18 00:32:18'),
	(17, 1, NULL, 'VIEW_MY_DATA', NULL, NULL, 'Entonces ahora muéstrame mis datos', '📋 *SUS DATOS REGISTRADOS*\n━━━━━━━━━━━━━━━━\n\n👤 *INFORMACIÓN PERSONAL:* Nombre: Paul Apellido: ⚠️ No registrado Teléfono: 51912528990 Email: ⚠️ No registrado Tipo Doc: ⚠️ No registrado Documento: ⚠️ No registrado Empresa: ⚠️ No registrada Cliente desde: 17/2/2026\n\n🚗 *VEHÍCULOS (1):*\n━━━━━━━━━━━━━━━━\n*1. TOYOTA Sin modelo asignado* (2000) 📋 Placa: BIM-123 🔑 VIN: 1HGBH41JZYU209486 🎨 Color: ⚠️ No registrado 📏 Kilometraje: ⚠️ No registrado ⚠️ *Requiere actualizar marca/modelo*\n\n━━━━━━━━━━━━━━━━', NULL, NULL, NULL, NULL, '2026-02-18 00:32:52'),
	(18, 1, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola, Paul! 👋\n\n🚗 Sus vehículos:\n• TOYOTA ? 2000 (BIM-123)\n\n¿En qué le ayudo hoy?', NULL, NULL, NULL, NULL, '2026-02-18 01:04:53'),
	(19, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Quiero actualizar mis datos', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 01:05:46'),
	(20, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Quiero agregar mi número de DNI', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Tipo doc: DNI\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 01:06:21'),
	(21, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Quiero agregar mi número de documento es 75066377', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Tipo doc: DNI\n✏️ Documento: 75066377\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 01:07:27'),
	(22, 1, NULL, 'VIEW_VEHICLES', NULL, NULL, 'Quiero ver todos los datos de mi vehículo', '🚗 *MIS VEHÍCULOS*\n━━━━━━━━━━━━━━━━\n*1. TOYOTA Sin modelo* (2000)\n   Placa: BIM-123\n   VIN: 1HGBH41JZYU209486\n   Color: ⚠️ Pendiente\n   Km: ⚠️ Pendiente\n━━━━━━━━━━━━━━━━\n\n💡 Para actualizar, escriba naturalmente:\n• "la marca es Toyota"\n• "el modelo es Hilux"\n• "placa BIM-123, color rojo, 50000 km"', NULL, NULL, NULL, NULL, '2026-02-18 01:08:00'),
	(23, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'El modelo es Hilux, el color es blanco y el kilometraje es de 10000', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Tipo doc: DNI\n✏️ Documento: 75066377\n✏️ Marca: Toyota\n✏️ Modelo: Hilux\n✏️ Año: 2000\n✏️ Placa: BIM-123\n✏️ VIN: 1HGBH41JZYU209486\n✏️ Color: blanco\n✏️ Km: 10000\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 01:08:47'),
	(24, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Mi email es poolrf@gmail.com', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Email: poolrf@gmail.com\n✏️ Tipo doc: DNI\n✏️ Documento: 75066377\n✏️ Marca: Toyota\n✏️ Modelo: Hilux\n✏️ Año: 2000\n✏️ Placa: BIM-123\n✏️ VIN: 1HGBH41JZYU209486\n✏️ Color: blanco\n✏️ Km: 10000\n\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 01:09:24'),
	(25, 1, NULL, 'FALLBACK', NULL, NULL, 'Que servicios tiene', '¿En qué puedo ayudarle?\n\n• 💰 Cotización\n• 📅 Agendar cita\n• 📋 Ver mis datos\n• 🚗 Ver mis vehículos\n• 👨‍🔧 Hablar con asesor', NULL, NULL, NULL, NULL, '2026-02-18 01:09:45'),
	(26, 1, NULL, 'QUOTE', NULL, NULL, 'Cotización', '💰 *SERVICIOS*\n\n(Consultar)\n\n¿Para cuál vehículo?\n1. TOYOTA ? 2000', NULL, NULL, NULL, NULL, '2026-02-18 01:10:44'),
	(27, 1, NULL, 'GREETING', NULL, NULL, 'HH ola', '¡Hola, Paul! 👋\n\n🚗 Sus vehículos:\n• TOYOTA frontier 2000 (BIM-123)\n\n¿En qué le ayudo hoy?', NULL, NULL, NULL, NULL, '2026-02-18 02:57:00'),
	(28, 1, NULL, 'QUOTE', NULL, NULL, 'Quiero cotizar precios', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 TOYOTA frontier 2000\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 03:00:57'),
	(29, 1, NULL, 'QUOTE', NULL, NULL, 'Si por favor', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 TOYOTA frontier 2000\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 03:01:33'),
	(30, 1, NULL, 'QUOTE', NULL, NULL, 'Si el de básico', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 TOYOTA frontier 2000\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 03:02:16'),
	(31, 1, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola, Paul! 👋\n\n🚗 Sus vehículos:\n• TOYOTA frontier 2000 (BIM-123)\n\n¿En qué le ayudo hoy?', NULL, NULL, NULL, NULL, '2026-02-18 03:26:19'),
	(32, 1, NULL, 'QUOTE', NULL, NULL, 'Quiero cotizar servicios', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 TOYOTA frontier 2000\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 03:26:47'),
	(33, 1, NULL, 'BOOK', NULL, NULL, 'El servicio básico', '📅 *AGENDAR CITA*\n━━━━━━━━━━━━━━━━\n👤 Paul\n🚗 TOYOTA frontier 2000 (BIM-123)\n🔧 Servicio: *BÁSICO*\n\n¿Qué fecha y horario le viene bien?\n\n🕐 *Horarios disponibles:*\n  Lun-Vie: 8:00 AM - 6:00 PM\n  Sábados: 8:00 AM - 1:00 PM\n\n_Responda con fecha y hora, ej: "Mañana a las 10am"_', NULL, NULL, NULL, NULL, '2026-02-18 03:46:24'),
	(34, 1, NULL, 'BOOK', NULL, NULL, 'El día viernes a las 10 am', '📅 *AGENDAR CITA*\n━━━━━━━━━━━━━━━━\n👤 Paul\n🚗 TOYOTA frontier 2000 (BIM-123)\n🔧 Servicio: *BÁSICO*\n\n¿Qué fecha y horario le viene bien?\n\n🕐 *Horarios disponibles:*\n  Lun-Vie: 8:00 AM - 6:00 PM\n  Sábados: 8:00 AM - 1:00 PM\n\n_Responda con fecha y hora, ej: "Mañana a las 10am"_', NULL, NULL, NULL, NULL, '2026-02-18 03:47:08'),
	(35, 1, NULL, 'BOOK', NULL, NULL, 'Pasado mañana a las 11 am', '📅 *AGENDAR CITA*\n━━━━━━━━━━━━━━━━\n👤 Paul\n🚗 TOYOTA frontier 2000 (BIM-123)\n🔧 Servicio: *BÁSICO*\n\n¿Qué fecha y horario le viene bien?\n\n🕐 *Horarios disponibles:*\n  Lun-Vie: 8:00 AM - 6:00 PM\n  Sábados: 8:00 AM - 1:00 PM\n\n_Responda con fecha y hora, ej: "Mañana a las 10am"_', NULL, NULL, NULL, NULL, '2026-02-18 03:47:34'),
	(36, 1, NULL, 'BOOK', NULL, NULL, 'Quiero agendar el día viernes a las 11am', '📅 *CITA REGISTRADA* ✅\n━━━━━━━━━━━━━━━━\n👤 Paul\n🚗 TOYOTA frontier 2000\n🔧 Servicio: *BÁSICO*\n📆 Fecha: *2026-02-20*\n🕐 Hora: *11:00 AM*\n━━━━━━━━━━━━━━━━\nLe enviaremos confirmación. ¡Le esperamos! 🔧', NULL, NULL, NULL, NULL, '2026-02-18 03:55:44'),
	(37, 1, NULL, 'VIEW_MY_DATA', NULL, NULL, 'Puedes mostrarme todos mis datos', '📋 *SUS DATOS*\n━━━━━━━━━━━━━━━━\n\n👤 *Datos personales:*\n   Nombre: Paul\n   Apellido: ⚠️ Pendiente\n   Teléfono: 51912528990\n   Email: ⚠️ Pendiente\n   Tipo Doc: ⚠️ Pendiente\n   Documento: ⚠️ Pendiente\n   Empresa: ⚠️ Pendiente\n   Desde: 17/2/2026\n\n🚗 *Vehículos (1):*\n━━━━━━━━━━━━━━━━\n*1. TOYOTA frontier* (2000)\n   Placa: BIM-123\n   VIN: 1HGBH41JZYU209486\n   Color: rojo\n   Km: ⚠️ Pendiente\n\n━━━━━━━━━━━━━━━━\n\n💡 Para actualizar, simplemente escriba los nuevos datos:\n• "mi email es ejemplo@mail.com"\n•', NULL, NULL, NULL, NULL, '2026-02-18 03:59:38'),
	(38, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'quiero actualizar el kilometraje de mi vehículo', '✅ *Datos guardados:*\n\n✏️ Marca: Toyota\n✏️ Modelo: Frontier\n✏️ Año: 2000\n✏️ Placa: BIM-123\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 04:22:46'),
	(39, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Quiero agregar el kilometraje de mi vehículo', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Marca: Toyota\n✏️ Modelo: Frontier\n✏️ Año: 2000\n✏️ Placa: BIM-123\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 04:23:22'),
	(40, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Quiero agregar mi DNI', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Tipo doc: DNI\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 04:24:17'),
	(41, 1, NULL, 'PROVIDE_DATA', NULL, NULL, 'Mi documento es 75066377', '✅ *Datos guardados:*\n\n✏️ Nombre: Paul\n✏️ Tipo doc: DNI\n✏️ Documento: 75066377\n✏️ Marca: Toyota\n✏️ Modelo: Frontier\n✏️ Año: 2000\n✏️ Placa: BIM-123\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 04:24:50'),
	(42, 1, NULL, 'VIEW_MY_DATA', NULL, NULL, 'Ahora muéstrame nuevamente mis datos', '📋 *SUS DATOS*\n━━━━━━━━━━━━━━━━\n\n👤 *Datos personales:*\n   Nombre: Paul\n   Apellido: ⚠️ Pendiente\n   Teléfono: 51912528990\n   Email: ⚠️ Pendiente\n   Tipo Doc: ⚠️ Pendiente\n   Documento: ⚠️ Pendiente\n   Empresa: ⚠️ Pendiente\n   Desde: 17/2/2026\n\n🚗 *Vehículos (1):*\n━━━━━━━━━━━━━━━━\n*1. TOYOTA frontier* (2000)\n   Placa: BIM-123\n   VIN: 1HGBH41JZYU209486\n   Color: rojo\n   Km: ⚠️ Pendiente\n\n━━━━━━━━━━━━━━━━\n\n💡 Para actualizar, simplemente escriba los nuevos datos:\n• "mi email es ejemplo@mail.com"\n•', NULL, NULL, NULL, NULL, '2026-02-18 04:26:35'),
	(43, 71, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola, DOE DOE BRACHIO! 👋\n\n¿En qué le ayudo hoy?', NULL, NULL, NULL, NULL, '2026-02-18 14:56:25'),
	(44, 71, NULL, 'ASK_SERVICE_INFO', NULL, NULL, 'Quiero consultar sobre precios', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 14:56:44'),
	(45, 71, NULL, 'VIEW_VEHICLES', NULL, NULL, 'Cual es mi carro', 'No tiene vehículos registrados.\n\nAgregue uno escribiendo:\n"Mi carro es Toyota Corolla 2020 placa ABC-123"', NULL, NULL, NULL, NULL, '2026-02-18 14:59:39'),
	(46, 71, NULL, 'PROVIDE_DATA', NULL, NULL, 'Y mi nissan qasqhai', '✅ *Datos guardados:*\n\n🚗 Vehículo: Nissan Qashqai\n\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 15:00:09'),
	(47, 75, NULL, 'GREETING', NULL, NULL, 'hi', '¡Hola! Bienvenido al *Taller Automotriz Premium* 🔧\n\nSoy su asistente virtual. Para atenderle mejor, puede enviarme todos sus datos en un solo mensaje:\n\n_Ejemplo:_\n"Me llamo Juan Pérez, mi email es juan@mail.com y tengo un Toyota Corolla 2020 placa ABC-123"\n\nO simplemente dígame, ¿en qué le ayudo?\n• 💰 Cotización\n• 📅 Agendar cita\n• ❓ Consultas', NULL, NULL, NULL, NULL, '2026-02-18 15:11:41'),
	(48, 75, NULL, 'PROVIDE_DATA', NULL, NULL, 'mi nombre es andre, tengo un chevrolet n400 y deseo hacer mtto', '✅ *Datos guardados:*\n\n👤 Registrado: andre\n🚗 Vehículo: Chevrolet N400\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 15:12:33'),
	(49, 75, NULL, 'QUOTE', NULL, NULL, 'cotizar mtto como le dije', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 Chevrolet N400\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 15:13:04'),
	(50, 75, NULL, 'BOOK', NULL, NULL, 'en que consiste el pimium', '📅 Para agendar, primero envíeme sus datos (nombre y vehículo).', NULL, NULL, NULL, NULL, '2026-02-18 15:13:34'),
	(51, 75, NULL, 'QUOTE', NULL, NULL, 'aun no dese agendar, sino cotizar', '💰 *SERVICIOS DISPONIBLES*\n━━━━━━━━━━━━━━━━\n🚗 Chevrolet N400\n━━━━━━━━━━━━━━━━\n\n*ALTO RENDIMIENTO*\n  • PULIDO: S/ 50.00\n  • UNDERCOATING: S/ 50.00\n\n*BASICO*\n  • basico: S/ 50.00\n\n*EXCLUSIVO*\n  • aditivos: S/ 15.00\n\n*PREMIUM*\n  • a/b: S/ 50.00\n\n*PREVENTIVO*\n  • 10km: S/ 10.00\n  • 20km: S/ 50.00\n\n━━━━━━━━━━━━━━━━\n¿Desea agendar algún servicio? 📅', NULL, NULL, NULL, NULL, '2026-02-18 15:13:57'),
	(52, 75, NULL, 'BOOK', NULL, NULL, 'basico', '📅 Para agendar, primero envíeme sus datos (nombre y vehículo).', NULL, NULL, NULL, NULL, '2026-02-18 15:14:16'),
	(53, 75, NULL, 'PROVIDE_DATA', NULL, NULL, 'este', '✅ *Datos guardados:*\n\n👤 Registrado: andre\n🚗 Vehículo: Chevrolet N400\n\n💡 ¿Desea agregar su email?\n¿Desea cotizar algún servicio? 💰', NULL, NULL, NULL, NULL, '2026-02-18 15:14:36'),
	(54, 82, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola! Bienvenido al *Taller Automotriz Premium* 🔧\n\nSoy su asistente virtual. Para atenderle mejor, puede enviarme todos sus datos en un solo mensaje:\n\n_Ejemplo:_\n"Me llamo Juan Pérez, mi email es juan@mail.com y tengo un Toyota Corolla 2020 placa ABC-123"\n\nO simplemente dígame, ¿en qué le ayudo?\n• 💰 Cotización\n• 📅 Agendar cita\n• ❓ Consultas', NULL, NULL, NULL, NULL, '2026-02-18 17:40:31'),
	(55, 82, NULL, 'ASK_LOCATION', NULL, NULL, 'Dónde estás', '📍 *UBICACIÓN*\nAv. Principal 123\nRef: Frente al parque central', NULL, NULL, NULL, NULL, '2026-02-18 17:40:41'),
	(56, 1, NULL, 'GREETING', NULL, NULL, 'Hola', '¡Hola, Paul RIVERA! 👋\n\n🚗 Sus vehículos:\n• TOYOTA frontier 2000 (BIM-123)\n\n¿En qué le ayudo hoy?', NULL, NULL, NULL, NULL, '2026-02-19 14:43:32'),
	(57, 1, '51912528990', 'GREETING', 'GREETING', '{}', 'Hola', 'Buenos días, _Paul RIVERA_.\n\n🚗 Sus vehículos:\n• TOYOTA frontier 2000 (BIM-123)\n\n¿En qué le puedo asistir hoy?', NULL, NULL, 1, NULL, '2026-02-19 15:27:37'),
	(58, 1, '51912528990', 'QUOTE', 'QUOTE', '{"service":null}', 'Quiero cotizar mantenimientos', 'Claro, _Paul RIVERA_. \n\n🔧 Para poder cotizar los mantenimientos, necesito saber qué tipo de servicio específico le gustaría realizar en su TOYOTA Frontier 2000. \n\nAlgunos de los servicios comunes son: \n- Mantenimiento básico \n- Cambio de aceite \n- Revisión de frenos \n- Alineación y balanceo \n\nPor favor, indíqueme el servicio que desea cotizar y le proporcionaré la información correspondiente.', NULL, NULL, 1, NULL, '2026-02-19 15:27:58'),
	(59, 1, '51912528990', 'QUOTE', 'QUOTE', '{"service":"mantenimiento básico"}', 'El mantenimiento básico', 'Claro, _Paul RIVERA_. \n\n🔧 El mantenimiento básico incluye: \n- Cambio de aceite \n- Revisión de filtros \n- Inspección de frenos \n- Revisión de fluidos \n\n💰 Pronto se actualizarán los precios en nuestro catálogo. \n\n¿Le gustaría agendar una cita para realizar este mantenimiento? Si es así, por favor indíqueme la fecha y hora que prefiere.', NULL, NULL, 1, NULL, '2026-02-19 15:28:47'),
	(60, 1, '51912528990', 'GREETING', 'GREETING', '{}', 'Hola', 'Buenos días, _Paul RIVERA_.\n\n🚗 Sus vehículos:\n• TOYOTA frontier 2000 (BIM-123)\n\n¿En qué le puedo asistir hoy?', NULL, NULL, 1, NULL, '2026-02-19 15:43:28'),
	(61, 1, '51912528990', 'QUOTE', 'QUOTE', '{"service":null}', 'Quisiera cotizar un servicio que tenga disponible, cuáles tien', 'Buenos días, _Paul RIVERA_.\n\n🔧 Actualmente, los servicios disponibles para su TOYOTA Frontier 2000 son:\n- Mantenimiento básico\n- Cambio de aceite\n- Revisión de frenos\n- Alineación y balanceo\n\n💰 Pronto se actualizarán los precios en nuestro catálogo. \n\nSi desea cotizar alguno de estos servicios o agendar una cita, por favor indíquelo.', NULL, NULL, 1, NULL, '2026-02-19 15:43:56'),
	(62, 1, '51912528990', 'QUOTE', 'QUOTE', '{"service":null}', 'Muéstrame los que tengas', 'Buenos días, _Paul RIVERA_.\n\n🔧 Actualmente, los servicios disponibles para su TOYOTA Frontier 2000 son:\n- **Mantenimiento básico**: Incluye cambio de aceite, revisión de filtros, inspección de frenos y revisión de fluidos.\n- **Cambio de aceite**: Cambio del aceite del motor y filtro de aceite.\n- **Revisión de frenos**: Inspección del sistema de frenos, incluyendo pastillas y discos.\n- **Alineación y balanceo**: Ajuste de los ángulos de las ruedas y balanceo de neumáticos.\n\n💰 Pronto se actualiz', NULL, NULL, 1, NULL, '2026-02-19 15:44:21'),
	(63, 1, '51912528990', 'PROVIDE_DATA', 'PROVIDE_DATA', '{"brand":null,"model":null,"year":null,"plate":null,"vin":null}', 'Quiero agregar un carro más', 'Claro, _Paul RIVERA_. \n\n🚗 Para poder agregar un nuevo vehículo, necesito que me proporcione la siguiente información: \n1. Marca del vehículo \n2. Modelo \n3. Año \n4. Placa \n5. VIN (Número de identificación del vehículo) \n\nQuedo atento a su respuesta.', NULL, NULL, 1, NULL, '2026-02-19 15:45:10'),
	(64, 1, '51912528990', 'PROVIDE_DATA', 'PROVIDE_DATA', '{"brand":"Renault","model":"Duster","year":"2011","plate":"ZXY-678","vin":"1HGBH41JZYU789875"}', '1. Renault \n2. Duster\n3. 2011\n4. ZXY-678\n5. 1HGBH41JZYU789875', 'Gracias por la información, _Paul RIVERA_. \n\n🔧 Procederé a verificar si el vehículo que desea agregar ya está registrado en nuestro sistema. \n\nPor favor, permítame un momento.', NULL, NULL, 1, NULL, '2026-02-19 15:46:46'),
	(65, 1, '51912528990', 'PROVIDE_DATA', 'PROVIDE_DATA', '{"brand":"Renault","model":"Duster","year":"2011","plate":"ZXY-678","vin":"1HGBH41JZYU789875"}', 'Hola quiero registrar un nuevo vehículo', 'Buenos días, _Paul RIVERA_.\n\n🚗 Procederé a registrar su nuevo vehículo:\n- **Marca**: Renault\n- **Modelo**: Duster\n- **Año**: 2011\n- **Placa**: ZXY-678\n- **VIN**: 1HGBH41JZYU789875\n\n🔧 El vehículo será registrado exitosamente en nuestro sistema.', NULL, NULL, 1, NULL, '2026-02-19 15:58:53'),
	(66, 1, '51912528990', 'PROVIDE_DATA', 'PROVIDE_DATA', '{"name":null,"apellido":null,"email":null,"document_type":null,"document_number":null,"brand":"Renault","model":"Duster","year":"2011","plate":"ZXY-678","vin":"1HGBH41JZYU789875","color":null,"kilometraje":null,"service":null,"date":null,"time":null}', 'Registral o por favor', 'Buenos días, _Paul RIVERA_.\n\n🔧 Procederé a registrar su nuevo vehículo:\n- **Marca**: Renault\n- **Modelo**: Duster\n- **Año**: 2011\n- **Placa**: ZXY-678\n- **VIN**: 1HGBH41JZYU789875\n\n✅ El vehículo será registrado exitosamente en nuestro sistema.', NULL, NULL, 1, NULL, '2026-02-19 15:59:36'),
	(67, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '', NULL, NULL, 1, NULL, '2026-02-19 17:20:59'),
	(68, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero registrar un nuevo vehículo', '', NULL, NULL, 1, NULL, '2026-02-19 17:21:41'),
	(69, 1, '51912528990', 'agent_v12', 'agent_response', NULL, '1. Renault  2. Duster 3. 2011 4. ZXY-678 5. 1HGBH41JZYU789875 6. Azul 7. 10000', '', NULL, NULL, 1, NULL, '2026-02-19 17:22:21'),
	(70, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Ahora quisiera cotizar precios de mantenimiento para ese vehículo', '', NULL, NULL, 1, NULL, '2026-02-19 17:23:07'),
	(71, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Cuales son los precios de mantenimiento para mí vehículo?', '', NULL, NULL, 1, NULL, '2026-02-19 21:33:51'),
	(72, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'En qué consiste el plan básico?', '', NULL, NULL, 1, NULL, '2026-02-19 21:36:30'),
	(73, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Me gustaría agendarlo para mañana por la mañana a las 10 Masomenos', '', NULL, NULL, 1, NULL, '2026-02-19 21:37:08'),
	(74, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Y quisiera ver mis datos actuales para poder actualizarlos', '', NULL, NULL, 1, NULL, '2026-02-19 21:38:23'),
	(75, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quisiera actualizar mi número de DNI ya que no lo veo', '', NULL, NULL, 1, NULL, '2026-02-19 21:39:04'),
	(76, 1, '51912528990', 'agent_v12', 'agent_response', NULL, '75066377', '', NULL, NULL, 1, NULL, '2026-02-19 21:39:34'),
	(77, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Muéstrame los datos ahora de todos mis vehículos', '', NULL, NULL, 1, NULL, '2026-02-19 21:40:09'),
	(78, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Hi', '', NULL, NULL, 1, NULL, '2026-02-19 21:55:02'),
	(79, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Cotizacion', '', NULL, NULL, 1, NULL, '2026-02-19 21:55:16'),
	(80, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'En qué consiste el básico', '', NULL, NULL, 1, NULL, '2026-02-19 21:55:43'),
	(81, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Que dura dura?', '', NULL, NULL, 1, NULL, '2026-02-19 21:56:26'),
	(82, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Que rptos se cambian?', '', NULL, NULL, 1, NULL, '2026-02-19 21:57:32'),
	(83, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Y en qué consiste el mtto exclusivo', '', NULL, NULL, 1, NULL, '2026-02-19 21:58:12'),
	(84, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'K rptos se cambian?', '', NULL, NULL, 1, NULL, '2026-02-19 21:59:18'),
	(85, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'K tiempo dura?', '', NULL, NULL, 1, NULL, '2026-02-19 21:59:45'),
	(86, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Precio?', '', NULL, NULL, 1, NULL, '2026-02-19 22:00:05'),
	(87, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Incluye igv?', '', NULL, NULL, 1, NULL, '2026-02-19 22:00:42'),
	(88, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Puedo ir ahora al taller?', '', NULL, NULL, 1, NULL, '2026-02-19 22:01:30'),
	(89, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'K horario tiene para mñn?', '', NULL, NULL, 1, NULL, '2026-02-19 22:01:53'),
	(90, 75, '51954476771', 'agent_v12', 'agent_response', NULL, '3pm x fv', '', NULL, NULL, 1, NULL, '2026-02-19 22:02:13'),
	(91, 75, '51954476771', 'agent_v12', 'agent_response', NULL, '5', '', NULL, NULL, 1, NULL, '2026-02-19 22:02:42'),
	(92, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Pero deseo mtto de 15km', '', NULL, NULL, 1, NULL, '2026-02-19 22:03:36'),
	(93, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'André pariona  43582817', '', NULL, NULL, 1, NULL, '2026-02-19 22:04:10'),
	(94, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'En k momento se cambia bujías?', '', NULL, NULL, 1, NULL, '2026-02-19 22:29:49'),
	(95, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Si pierde fuerza el carro que se necesita?', '', NULL, NULL, 1, NULL, '2026-02-19 22:30:28'),
	(96, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Hace 2 años que no hago mtto, crees que sea por eso?', '', NULL, NULL, 1, NULL, '2026-02-19 22:42:03'),
	(97, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Que tipos de bujías necesito?', '', NULL, NULL, 1, NULL, '2026-02-19 22:43:48'),
	(98, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Es un Chevrolet sail 2022', '', NULL, NULL, 1, NULL, '2026-02-19 22:44:23'),
	(99, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Me olvidé. Me puede reprogramar no podré ir hoy', 'Buenos días, señor Andre Pariona. Para poder reprogramar su cita, necesitaría que me indique el servicio que desea, así como la nueva fecha y hora que le gustaría agendar. Quedo atento a su respuesta. 😊', NULL, NULL, 1, NULL, '2026-02-20 12:03:17'),
	(100, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'El mismo servicio para el lunes 10am', 'Para proceder con la reprogramación, necesito confirmar el servicio que desea agendar. Por favor, indíqueme si es el servicio de "ALTO RENDIMIENTO" o algún otro. Quedo a la espera de su respuesta. 😊', NULL, NULL, 1, NULL, '2026-02-20 12:03:52'),
	(101, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', 'Buenos días, ¿en qué puedo ayudarle hoy?', NULL, NULL, 1, NULL, '2026-02-20 13:00:25'),
	(102, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'en k consite el basico?', 'Buenos días, señor Andre Pariona. \n\nEl servicio básico consiste en un chequeo preventivo de su vehículo. En nuestro catálogo, tenemos las siguientes opciones:\n\n[PREVENTIVO]:\n  - 10km: S/ 10.00 | Descripción: chequeo preventivo para vehículos que han recorrido hasta 10 km.\n  - 20km: S/ 50.00 | Descripción: chequeo preventivo para vehículos que han recorrido hasta 20 km.\n\nSi desea más información o desea agendar una cita, no dude en decírmelo. 😊', NULL, NULL, 1, NULL, '2026-02-20 14:24:38'),
	(103, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'el basico?', 'Buenos días, señor Andre Pariona. \n\nEl servicio básico que ofrecemos es el **1° Mantenimiento**, que tiene un costo de **S/ 10.00**. Este incluye el cambio de filtro, aceite y arandela. Es compatible con los siguientes vehículos: Nissan Qashqai 2015, Nissan Qashqai 2016 y Renault Duster 2011.\n\nSi desea más información o desea agendar una cita, no dude en decírmelo. 😊', NULL, NULL, 1, NULL, '2026-02-20 15:39:42'),
	(104, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'el preventivo?', 'Buenos días, señor Andre Pariona.\n\nEn la categoría de **Mantenimiento Preventivo**, ofrecemos los siguientes servicios:\n\n- **1° Mantenimiento**: S/ 10.00 | Descripción: cambio de filtro, aceite, arandela (compatibles: Nissan Qashqai 2015, Nissan Qashqai 2016, Renault Duster 2011).\n- **2° Mantenimiento**: S/ 50.00 (compatibles: Nissan Qashqai 2015, Nissan Qashqai 2016, Renault Duster 2011).\n- **3° Mantenimiento**: Consultar.\n- **4° Mantenimiento**: Consultar.\n- **5° Mantenimiento**: Consultar.\n\nSi está interesado en alguno de estos servicios o desea agendar una cita, por favor házmelo saber. 😊', NULL, NULL, 1, NULL, '2026-02-20 15:40:37'),
	(105, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'el premium?', 'Buenos días, señor Andre Pariona.\n\nEn la categoría de **Mantenimiento Premium**, ofrecemos los siguientes servicios:\n\n- **Aditivo de motor y de combustible**: S/ 15.00 | (compatibles: Nissan Qashqai 2015, Renault Duster 2011, Nissan Qashqai 2016).\n- **Alineamiento y Balanceo electrónico**: S/ 120.00 | (compatibles: Nissan Qashqai 2015, Nissan Qashqai 2016, Renault Duster 2011).\n- **Sanitización de ductos de ventilación**: S/ 60.00 | (compatibles: Nissan Qashqai 2015, Nissan Qashqai 2016, Renault Duster 2011).\n\nEste servicio incluye todo lo del Mantenimiento Preventivo más los servicios mencionados. Si desea más información o desea agendar una cita, no dude en comunicármelo. 😊', NULL, NULL, 1, NULL, '2026-02-20 15:45:10'),
	(106, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'El mes pasado lleve mi carro y lo malgatrln el a/c', 'Buenos días, señor Andre Pariona.\n\nLamento mucho escuchar que ha tenido problemas con el aire acondicionado de su vehículo. Sin embargo, no tengo registro de vehículos asociados a su ID en nuestro sistema. Para poder ayudarle de la mejor manera, le agradecería que me proporcione la marca y modelo de su vehículo, así como cualquier otro detalle relevante.\n\nUna vez que tengamos esa información, podremos revisar su situación y ofrecerle la mejor solución. Quedo a su disposición.', NULL, NULL, 1, NULL, '2026-02-20 16:36:11'),
	(107, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Chevrolet n400', 'Buenos días, señor Andre Pariona.\n\nProcederé a registrar su vehículo Chevrolet N400 en nuestro sistema. Para ello, necesitaré la siguiente información adicional:\n\n1. Año del vehículo.\n2. Placa del vehículo.\n3. Número VIN (17 caracteres).\n4. Color del vehículo.\n5. Kilometraje actual.\n\nUna vez que tenga estos datos, podré completar el registro. Quedo a la espera de su respuesta. 😊', NULL, NULL, 1, NULL, '2026-02-20 16:36:57'),
	(108, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'Ingreso x mtto 15km clf450, no tengo con. Blanco y tiene 19900km', 'He registrado su vehículo Chevrolet N400 con la placa CLF450, color blanco y un kilometraje de 19,900 km en nuestro sistema. \n\nSi desea agendar una cita para revisar el problema del aire acondicionado o cualquier otro servicio, por favor indíqueme la fecha y hora que le convenga. Estoy aquí para ayudarle. 😊', NULL, NULL, 1, NULL, '2026-02-20 16:41:12'),
	(109, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'pero le pregunto como solucionarán lo k malograron', 'Entiendo su preocupación, señor Andre Pariona, y lamento sinceramente los inconvenientes que ha experimentado con el aire acondicionado de su vehículo.\n\nPara abordar este problema, le recomiendo que agendemos una cita para que nuestros técnicos revisen el sistema de aire acondicionado y determinen la causa del mal funcionamiento. Una vez que realicen la revisión, podrán informarle sobre las reparaciones necesarias y los costos asociados.\n\nSi está de acuerdo, por favor indíqueme la fecha y hora que le convenga para la cita, y procederé a agendarla. Estoy aquí para ayudarle en lo que necesite. 😊', NULL, NULL, 1, NULL, '2026-02-20 17:06:16'),
	(110, 75, '51954476771', 'agent_v12', 'agent_response', NULL, 'pero si uds malograron como voy a pagar eso?', 'Comprendo su frustración, señor Andre Pariona, y lamento mucho la situación. Es totalmente razonable que no desee asumir costos por un daño que pudo haber sido causado durante el servicio.\n\nLe sugiero que se comunique directamente con nuestro departamento de atención al cliente para que puedan evaluar su caso y ofrecerle una solución adecuada. Ellos podrán revisar el historial de servicios y determinar cómo proceder con la reparación del aire acondicionado sin costo adicional para usted.\n\nSi desea, puedo ayudarle a agendar una cita para que se realice la revisión del aire acondicionado y así podamos resolver este inconveniente. Por favor, indíqueme la fecha y hora que le convenga. Estoy aquí para ayudarle. 😊', NULL, NULL, 1, NULL, '2026-02-20 17:20:44'),
	(111, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', 'Buenas tardes, ¿en qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-27 19:28:08'),
	(112, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quisiera ver los tipos de mantenimiento para mí vehículo', 'Claro, con gusto le detallo los tipos de mantenimiento disponibles:\n\n1. **BÁSICO (1.5h)**: Incluye cambio de aceite y filtro, escaneo electrónico y lavado exterior.\n   \n2. **PREVENTIVO (5h)**: Incluye el servicio básico más bujías, filtros, fajas, refrigerante y líquidos.\n\n3. **PREMIUM (6h)**: Incluye el servicio preventivo más alineamiento, balanceo, aditivos y aire acondicionado (A/C).\n\n4. **EXCLUSIVO (5 días)**: Incluye el servicio premium más lavado de salón, pintura de aros, pulido de faros y recojo a domicilio.\n\n5. **ALTO RENDIMIENTO (9 días)**: Incluye el servicio exclusivo más undercoating, zincado, pulido y laminado.\n\nSi desea más información sobre alguno de estos servicios o desea agendar una cita, por favor hágamelo saber.', NULL, NULL, 1, NULL, '2026-02-27 19:28:35'),
	(113, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Antes de ello quisiera saber los precios', 'Lamentablemente, no hay precios específicos disponibles para los vehículos que usted posee (TOYOTA frontier 2000 y Renault Duster 2011). Le recomiendo consultar con un asesor para obtener información sobre los precios de los servicios.\n\nSi desea proceder con alguna consulta adicional o agendar una cita, por favor indíquelo.', NULL, NULL, 1, NULL, '2026-02-27 19:29:02'),
	(114, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Vuelve a revisar por favor me dijeron que recién actualizaron ello', 'Lamento informarle que, según la información actual, no hay precios específicos disponibles para los vehículos que usted posee. Para obtener detalles sobre los precios, le sugiero que consulte directamente con un asesor en el taller.\n\nSi hay algo más en lo que pueda asistirle, por favor hágamelo saber.', NULL, NULL, 1, NULL, '2026-02-27 19:40:23'),
	(115, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'En todo caso me puedes mostrar los vehículos que tengo y sus respectivos datos', 'Claro, a continuación le presento los vehículos que tiene registrados:\n\n1. **TOYOTA frontier 2000**\n   - Placa: BIM-123\n   - ID: 6\n\n2. **Renault Duster 2011**\n   - Placa: ZXY-678\n   - ID: 7\n\nSi necesita más información o desea realizar alguna gestión relacionada con sus vehículos, no dude en decírmelo.', NULL, NULL, 1, NULL, '2026-02-27 21:13:05'),
	(116, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Los costos de mantenimiento para el segundo carro', 'Para el Renault Duster 2011 (ZXY-678), no hay precios específicos listados en el catálogo. Se recomienda consultar con un asesor para obtener información sobre los costos de mantenimiento.\n\nSi desea, puedo ayudarle a agendar una cita para que un asesor le brinde más detalles. ¿Le gustaría proceder con eso?', NULL, NULL, 1, NULL, '2026-02-27 21:13:49'),
	(117, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola podrías volver a consultar por favor', 'Mis disculpas por la confusión anterior. A continuación, le detallo los costos de mantenimiento para el Renault Duster 2011 (ZXY-678):\n\n### Mantenimiento Preventivo\n- **1° Mantenimiento:** S/ 10.00\n- **10° Mantenimiento:** Consultar\n- **2° a 9° Mantenimiento:** Consultar\n\n### Mantenimiento Premium\n- **Aditivo de motor y de combustible:** S/ 100.00\n- **Alineamiento y Balanceo electrónico:** S/ 130.00\n- **Sanitización de ductos de ventilación:** S/ 150.00\n\n### Mantenimiento Exclusivo\n- **Lavado de salón:** S/ 420.00\n- **Pintura de los 4 aros:** S/ 360.00\n- **Pulido de faros:** S/ 180.00\n- **Recojo y Entrega a domicilio:** S/ 500.00\n\n### Mantenimiento Alto Rendimiento\n- **2 Paños de pintura:** S/ 650.00\n- **Laminado:** S/ 750.00\n- **Pulido general:** S/ 570.00\n- **Undercoating + Zincado:** S/ 890.00\n\nSi desea más información sobre alguno de estos servicios o desea agendar una cita, por favor hágamelo saber.', NULL, NULL, 1, NULL, '2026-02-27 22:12:23'),
	(118, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Cuánto me costaría el mantenimiento premium y en qué consiste', 'El Mantenimiento Premium para su Renault Duster 2011 (ZXY-678) incluye los siguientes servicios:\n\n### Mantenimiento Premium\n- **Aditivo de motor y de combustible:** S/ 100.00\n- **Alineamiento y Balanceo electrónico:** S/ 130.00\n- **Sanitización de ductos de ventilación:** S/ 150.00\n\n### Total Referencial\n- **TOTAL:** S/ 380.00\n\n### Descripción de los servicios:\n- **Aditivo de motor y de combustible:** Es para una limpieza profunda interna del motor generando carbonilla y existen aditivos para vehículos gasolineros y petroleros.\n- **Alineamiento y Balanceo electrónico:** Ajusta los ángulos de las ruedas para que estén paralelas y perpendiculares al suelo, asegurando un rodaje recto y reduciendo el desgaste.\n- **Sanitización de ductos de ventilación:** Purifica el aire y las superficies dentro de vehículos, eliminando hasta el 99.99% de virus, bacterias, hongos y malos olores, sin usar químicos.\n\n*Este precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.*\n\n¿', NULL, NULL, 1, NULL, '2026-02-27 22:58:21'),
	(119, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-27 23:11:48'),
	(120, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quisiera cotizar precios de mantenimiento para mí vehículo', 'Por supuesto, con gusto le ayudaré a cotizar los precios de mantenimiento para su vehículo. Para ello, por favor indíqueme qué tipo de mantenimiento le interesa: \n\n1. **Mantenimiento Básico**\n2. **Mantenimiento Revisión Express**\n3. **Mantenimiento Preventivo**\n4. **Mantenimiento Premium**\n5. **Mantenimiento Exclusivo**\n6. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-27 23:12:26'),
	(121, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'En qué consiste el premium?', 'El Mantenimiento Premium para su Renault Duster 2011 (ZXY-678) incluye los siguientes servicios:\n\n### Mantenimiento Premium\n1. **Aditivo de motor y de combustible:** S/ 100.00\n   - Este servicio ayuda a limpiar el motor y optimizar el rendimiento del combustible.\n\n2. **Alineamiento y Balanceo electrónico:** S/ 130.00\n   - Ajusta los ángulos de las ruedas para asegurar un rodaje recto y reducir el desgaste de los neumáticos.\n\n3. **Sanitización de ductos de ventilación:** S/ 150.00\n   - Purifica el aire dentro del vehículo, eliminando virus, bacterias, hongos y malos olores.\n\n### Total Referencial\n- **TOTAL:** S/ 380.00\n\n*Este precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.*\n\nSi desea proceder con la cotización o agendar una cita, por favor hágamelo saber.', NULL, NULL, 1, NULL, '2026-02-27 23:13:02'),
	(122, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-27 23:20:08'),
	(123, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero cotizar el mantenimiento de mi vehículo', 'Por supuesto, con gusto le ayudaré a cotizar el mantenimiento de su vehículo. Para ello, por favor indíqueme qué tipo de mantenimiento le interesa:\n\n1. **Mantenimiento Preventivo**\n2. **Mantenimiento Premium**\n3. **Mantenimiento Exclusivo**\n4. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-27 23:20:26'),
	(124, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Me interesa el exclusivo', 'Para el Mantenimiento Exclusivo de su Renault Duster 2011 (ZXY-678), los servicios incluidos son los siguientes:\n\n### Mantenimiento Exclusivo\n1. **Aditivo de motor y de combustible:** S/ 100.00\n2. **Alineamiento y Balanceo electrónico:** S/ 130.00\n3. **Sanitización de ductos de ventilación:** S/ 150.00\n4. **Lavado de salón:** S/ 420.00\n5. **Pintura de los 4 aros:** S/ 360.00\n6. **Pulido de faros:** S/ 180.00\n7. **Recojo y Entrega a domicilio:** S/ 500.00\n8. **Seguro de aros:** S/ 600.00\n\n### Total Referencial\n- **TOTAL:** S/ 2450.00\n\n*Este precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.*\n\n¿Desea proceder con la cotización o agendar una cita para confirmar el precio final con un asesor?', NULL, NULL, 1, NULL, '2026-02-27 23:21:34'),
	(125, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Y el mantenimiento premium', 'Para el Mantenimiento Premium de su Renault Duster 2011 (ZXY-678), los servicios incluidos son los siguientes:\n\n### Mantenimiento Premium\n1. **Aditivo de motor y de combustible:** S/ 100.00\n2. **Alineamiento y Balanceo electrónico:** S/ 130.00\n3. **Sanitización de ductos de ventilación:** S/ 150.00\n\n### Total Referencial\n- **TOTAL:** S/ 380.00\n\n*Este precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.*\n\nSi desea proceder con la cotización o agendar una cita para confirmar el precio final con un asesor, por favor hágamelo saber.', NULL, NULL, 1, NULL, '2026-02-27 23:23:13'),
	(126, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-27 23:38:45'),
	(127, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quisiera cotizar precios de mantenimiento para mí vehículo', 'Por supuesto, con gusto le ayudaré a cotizar los precios de mantenimiento para su vehículo. Para ello, por favor indíqueme qué tipo de mantenimiento le interesa:\n\n1. **Mantenimiento Preventivo**\n2. **Mantenimiento Premium**\n3. **Mantenimiento Exclusivo**\n4. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-27 23:39:04'),
	(128, 1, '51912528990', 'agent_v12', 'agent_response', NULL, '1', 'Para su Renault Duster 2011 (ZXY-678), el Mantenimiento Preventivo incluye:\n\n### Mantenimiento Preventivo\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n\n### Total Referencial\n- **TOTAL SI ELIGE TODOS:** S/ 100.00\n\n¿Cuales servicios desea incluir? Responda con los números separados por coma (ej: 1,3) o escriba \'todos\' para incluirlos todos.', NULL, NULL, 1, NULL, '2026-02-27 23:39:39'),
	(129, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Antes de ello me puedes decir en qué consiste', 'El Mantenimiento Preventivo para su Renault Duster 2011 (ZXY-678) consiste en una serie de servicios programados que tienen como objetivo asegurar el correcto funcionamiento del vehículo y prevenir posibles fallas. Los servicios incluidos son los siguientes:\n\n1. **1° Mantenimiento:** Revisión inicial del vehículo.\n2. **2° Mantenimiento:** Inspección de componentes mecánicos y eléctricos.\n3. **3° Mantenimiento:** Cambio de fluidos y filtros.\n4. **4° Mantenimiento:** Revisión de frenos y suspensión.\n5. **5° Mantenimiento:** Inspección de sistema de dirección.\n6. **6° Mantenimiento:** Revisión de luces y señales.\n7. **7° Mantenimiento:** Chequeo de neumáticos y alineación.\n8. **8° Mantenimiento:** Revisión de sistema de escape.\n9. **9° Mantenimiento:** Inspección de batería y sistema eléctrico.\n10. **10° Mantenimiento:** Revisión general y recomendaciones.\n\nEste mantenimiento es esencial para prolongar la vida útil de su vehículo y garantizar su seguridad en la carretera.\n\nSi desea proced', NULL, NULL, 1, NULL, '2026-02-27 23:40:20'),
	(130, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Y el mantenimiento premium en qué consiste y cuánto está', 'El Mantenimiento Premium para su Renault Duster 2011 (ZXY-678) incluye todos los servicios del Mantenimiento Preventivo, además de algunos adicionales que mejoran el rendimiento y la comodidad del vehículo. A continuación, se detallan los servicios incluidos:\n\n### Mantenimiento Premium\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n\n#### Adicionales del Mantenimiento Premium\n11. **Aditivo de motor y de combustible:** S/ 100.00\n12. **Alineamiento y Balanceo electrónico:** S/ 130.00\n13. **Sanitización de ductos de ventilación:** S/ 150.00\n\n### Total Referencial\n- **TOTAL SI ELIGE TODOS:** S/ 480.00\n\nEste precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.\n\nSi desea pr', NULL, NULL, 1, NULL, '2026-02-27 23:40:58'),
	(131, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Y el mantenimiento exclusivo?', 'El Mantenimiento Exclusivo para su Renault Duster 2011 (ZXY-678) incluye todos los servicios del Mantenimiento Premium, además de una serie de servicios adicionales que ofrecen un cuidado más completo y detallado del vehículo. A continuación, se detallan los servicios incluidos:\n\n### Mantenimiento Exclusivo\n#### Del Mantenimiento Premium:\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n\n#### Adicionales del Mantenimiento Exclusivo:\n11. **Aditivo de motor y de combustible:** S/ 100.00\n12. **Alineamiento y Balanceo electrónico:** S/ 130.00\n13. **Sanitización de ductos de ventilación:** S/ 150.00\n14. **Lavado de salón:** S/ 420.00\n15. **Pintura de los 4 aros:** S/ 360.00\n16. **Pulido de faros:** S/ 1', NULL, NULL, 1, NULL, '2026-02-27 23:42:07'),
	(132, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-27 23:53:02'),
	(133, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero cotizar mantenimientos para mí vehículo', 'Con gusto le ayudaré a cotizar los mantenimientos para su vehículo. Por favor, indíqueme qué tipo de mantenimiento le interesa:\n\n1. **Mantenimiento Básico**\n2. **Mantenimiento Revisión Express**\n3. **Mantenimiento Preventivo**\n4. **Mantenimiento Premium**\n5. **Mantenimiento Exclusivo**\n6. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-27 23:53:35'),
	(134, 1, '51912528990', 'agent_v12', 'agent_response', NULL, '1', 'Para su Renault Duster 2011 (ZXY-678), el Mantenimiento Básico requiere consulta con un asesor, por lo que no puedo proporcionarle un precio específico en este momento.\n\nSi lo desea, puedo ofrecerle información sobre otros tipos de mantenimiento, como el Mantenimiento Preventivo, Premium, Exclusivo o Alto Rendimiento, que tienen precios establecidos. ¿Le gustaría conocer alguno de estos?', NULL, NULL, 1, NULL, '2026-02-27 23:53:56'),
	(135, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-28 00:21:20'),
	(136, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quisiera cotizar un mantenimiento para mí carro', 'Con gusto le ayudaré a cotizar el mantenimiento para su vehículo. Por favor, indíqueme qué tipo de mantenimiento le interesa:\n\n1. **Mantenimiento Básico**\n2. **Mantenimiento Revisión Express**\n3. **Mantenimiento Preventivo**\n4. **Mantenimiento Premium**\n5. **Mantenimiento Exclusivo**\n6. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-28 00:21:39'),
	(137, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'El exclusivo en qué consiste', 'El Mantenimiento Exclusivo para su Renault Duster 2011 (ZXY-678) incluye todos los servicios del Mantenimiento Premium, además de una serie de servicios adicionales que ofrecen un cuidado más completo y detallado del vehículo. A continuación, se detallan los servicios incluidos:\n\n### Mantenimiento Exclusivo\n#### Del Mantenimiento Premium:\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n\n#### Adicionales del Mantenimiento Exclusivo:\n11. **Aditivo de motor y de combustible:** S/ 100.00\n12. **Alineamiento y Balanceo electrónico:** S/ 130.00\n13. **Sanitización de ductos de ventilación:** S/ 150.00\n14. **Lavado de salón:** S/ 420.00\n15. **Pintura de los 4 aros:** S/ 360.00\n16. **Pulido de faros:** S/ 1', NULL, NULL, 1, NULL, '2026-02-28 00:22:03'),
	(138, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-28 00:29:07'),
	(139, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero cotizar el mantenimiento exclusivo', 'Para su Renault Duster 2011 (ZXY-678), el Mantenimiento Exclusivo incluye los siguientes servicios:\n\n### Mantenimiento Exclusivo\n#### Del Mantenimiento Premium:\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n\n#### Adicionales del Mantenimiento Exclusivo:\n11. **Aditivo de motor y de combustible:** S/ 100.00\n12. **Alineamiento y Balanceo electrónico:** S/ 130.00\n13. **Sanitización de ductos de ventilación:** S/ 150.00\n14. **Lavado de salón:** S/ 420.00\n15. **Pintura de los 4 aros:** S/ 360.00\n16. **Pulido de faros:** S/ 180.00\n17. **Recojo y Entrega a domicilio:** S/ 500.00\n18. **Seguro de aros:** S/ 600.00\n\n### Total Referencial\n- **TOTAL SI ELIGE TODOS:** S/ 2540.00\n\nEste precio es un costo refer', NULL, NULL, 1, NULL, '2026-02-28 00:29:28'),
	(140, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-28 01:03:43'),
	(141, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero cotizar precios de mantenimiento', 'Con gusto le ayudaré a cotizar los mantenimientos para su vehículo. Por favor, indíqueme qué tipo de mantenimiento le interesa:\n\n1. **Mantenimiento Básico**\n2. **Mantenimiento Revisión Express**\n3. **Mantenimiento Preventivo**\n4. **Mantenimiento Premium**\n5. **Mantenimiento Exclusivo**\n6. **Mantenimiento Alto Rendimiento**\n\nUna vez que me indique su elección, le proporcionaré los detalles y precios correspondientes.', NULL, NULL, 1, NULL, '2026-02-28 01:04:10'),
	(142, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Premium', 'Para su Renault Duster 2011 (ZXY-678), el Mantenimiento Premium incluye los siguientes servicios:\n\n### Mantenimiento Premium\n1. **1° Mantenimiento:** S/ 10.00\n2. **2° Mantenimiento:** S/ 10.00\n3. **3° Mantenimiento:** S/ 10.00\n4. **4° Mantenimiento:** S/ 10.00\n5. **5° Mantenimiento:** S/ 10.00\n6. **6° Mantenimiento:** S/ 10.00\n7. **7° Mantenimiento:** S/ 10.00\n8. **8° Mantenimiento:** S/ 10.00\n9. **9° Mantenimiento:** S/ 10.00\n10. **10° Mantenimiento:** S/ 10.00\n11. **Aditivo de motor y de combustible:** S/ 100.00\n12. **Alineamiento y Balanceo electrónico:** S/ 130.00\n13. **Sanitización de ductos de ventilación:** S/ 150.00\n\n### Total Referencial\n- **TOTAL SI ELIGE TODOS:** S/ 480.00\n\nEste precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.\n\n¿Desea incluir todos los servicios mencionados o seleccionar algunos en particular? Por favor, indíqueme su elección.', NULL, NULL, 1, NULL, '2026-02-28 01:04:41'),
	(143, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Del premium solo quiero el 11 y el 12', 'Cotización para su Renault Duster 2011 (ZXY-678):\n\n### Mantenimiento Premium\n1. **Aditivo de motor y de combustible:** S/ 100.00\n2. **Alineamiento y Balanceo electrónico:** S/ 130.00\n\n### Total Referencial\n- **TOTAL:** S/ 230.00\n\nEste precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.\n\n¿Desea agendar una cita para realizar estos servicios? Si es así, por favor indíqueme la fecha y hora que le gustaría.', NULL, NULL, 1, NULL, '2026-02-28 01:05:29'),
	(144, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'El sábado por la noche?', 'Para poder agendar la cita, necesitaría que me indique la hora específica en la que desea realizar el mantenimiento el sábado por la noche. Por favor, proporcione la hora (por ejemplo, 18:00, 19:00, etc.) y confirmaré la cita para usted.', NULL, NULL, 1, NULL, '2026-02-28 01:08:38'),
	(145, 1, '51912528990', 'agent_v12', 'agent_response', NULL, '7 pm', 'Su cita ha sido agendada con éxito para el **sábado 4 de noviembre a las 7:00 PM** para los servicios de **Aditivo de motor y de combustible** y **Alineamiento y Balanceo electrónico**.\n\nSi tiene alguna otra consulta o necesita asistencia adicional, no dude en decírmelo. ¡Le esperamos en el taller!', NULL, NULL, 1, NULL, '2026-02-28 01:09:10'),
	(146, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Puedes mostrarme el detalle de la cita?', 'Claro, aquí tiene el detalle de su cita:\n\n### Detalle de la Cita\n- **Fecha:** Sábado, 4 de noviembre\n- **Hora:** 7:00 PM\n- **Servicios a realizar:**\n  1. **Aditivo de motor y de combustible:** S/ 100.00\n  2. **Alineamiento y Balanceo electrónico:** S/ 130.00\n\n### Total Referencial\n- **TOTAL:** S/ 230.00\n\nEste precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.\n\nSi necesita realizar algún cambio o tiene alguna pregunta adicional, no dude en comunicarse. ¡Le esperamos!', NULL, NULL, 1, NULL, '2026-02-28 01:09:38'),
	(147, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Lo podemos cambiar mejor para las 4pm', 'Su cita ha sido reprogramada con éxito para el **sábado 4 de noviembre a las 4:00 PM** para los servicios de **Aditivo de motor y de combustible** y **Alineamiento y Balanceo electrónico**.\n\nSi tiene alguna otra consulta o necesita asistencia adicional, no dude en decírmelo. ¡Le esperamos en el taller!', NULL, NULL, 1, NULL, '2026-02-28 01:10:50'),
	(148, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Hola', '¡Buenas tardes! ¿En qué puedo asistirle hoy?', NULL, NULL, 1, NULL, '2026-02-28 01:59:00'),
	(149, 1, '51912528990', 'agent_v12', 'agent_response', NULL, 'Quiero cotizar el mantenimiento exclusivo', 'Para su Renault Duster 2011 (ZXY-678), el Mantenimiento Exclusivo incluye los siguientes servicios:\n\n### Mantenimiento Exclusivo\n- **BASE FIJA (incluye Premium completo):** S/ 480.00\n\n#### Servicios adicionales del Exclusivo (puede elegir cuáles agregar):\n1. **Lavado de salón:** S/ 420.00\n2. **Pintura de los 4 aros:** S/ 360.00\n3. **Pulido de faros:** S/ 180.00\n4. **Recojo y Entrega a domicilio:** S/ 500.00\n5. **Seguro de aros:** S/ 600.00\n\n### Total Referencial\n- **TOTAL SI ELIGE TODOS:** S/ 2540.00\n\nEste precio es un costo referencial aproximado, sujeto a revisión técnica en el taller.\n\n¿Desea incluir todos los servicios mencionados o seleccionar algunos en particular? Por favor, indíqueme su elección.', NULL, NULL, 1, NULL, '2026-02-28 01:59:19');

-- Volcando datos para la tabla u330129056_picaje.agent_quotes: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.algoritmo_visita: ~3 rows (aproximadamente)
INSERT IGNORE INTO `algoritmo_visita` (`id`, `modelo_id`, `marca_id`, `kilometraje`, `meses`, `años`) VALUES
	(1, 21, 14, 5000.00, 6, '["2010-9999"]'),
	(6, 21, 14, 5000.00, 6, '["0001-9999"]'),
	(7, 21, 14, 5000.00, 6, '["0001-9999"]');

-- Volcando datos para la tabla u330129056_picaje.appointments: ~4 rows (aproximadamente)
INSERT IGNORE INTO `appointments` (`id`, `cliente_id`, `vehiculo_id`, `package_id`, `quote_id`, `appointment_date`, `appointment_time`, `shift`, `status`, `notes`, `reminder_sent`, `created_at`, `updated_at`) VALUES
	(1, 3, 6, NULL, NULL, '2023-10-07', '10:00:00', 'AM', 'REQUESTED', 'Servicio Básico. Agendado via WhatsApp.', 0, '2026-02-19 21:37:04', '2026-02-19 21:37:04'),
	(2, 5, NULL, NULL, NULL, '2023-10-06', '15:00:00', 'PM', 'REQUESTED', 'Servicio Preventivo 20km. Agendado via WhatsApp.', 0, '2026-02-19 22:04:06', '2026-02-19 22:04:06'),
	(3, 3, 6, NULL, NULL, '2023-11-04', '19:00:00', 'PM', 'REQUESTED', 'Aditivo de motor y de combustible, Alineamiento y Balanceo electrónico. Agendado via WhatsApp.', 0, '2026-02-28 01:09:00', '2026-02-28 01:09:00'),
	(4, 3, 6, NULL, NULL, '2023-11-04', '16:00:00', 'PM', 'REQUESTED', 'Aditivo de motor y de combustible y Alineamiento y Balanceo electrónico. Agendado via WhatsApp.', 0, '2026-02-28 01:10:45', '2026-02-28 01:10:45');

-- Volcando datos para la tabla u330129056_picaje.carrosparamantenimiento: ~3 rows (aproximadamente)
INSERT IGNORE INTO `carrosparamantenimiento` (`id`, `year`, `version`, `modelo_id`, `marca_id`, `clase_id`) VALUES
	(1, 2011, 'v44', 6, 15, 1),
	(2, 2015, 'b56', 4, 7, 1),
	(3, 2016, 'b76', 4, 7, 1);

-- Volcando datos para la tabla u330129056_picaje.centros: ~4 rows (aproximadamente)
INSERT IGNORE INTO `centros` (`id`, `nombre`, `created_at`) VALUES
	(1, 'Centro Arequipa', '2026-01-27 04:32:14'),
	(2, 'Centro Trujillo', '2026-01-28 02:43:48'),
	(3, 'Centro Chiclayo', '2026-02-15 19:46:55'),
	(4, 'Centro Lima', '2026-02-15 19:47:01');

-- Volcando datos para la tabla u330129056_picaje.cita_archivos: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.cita_motivos: ~3 rows (aproximadamente)
INSERT IGNORE INTO `cita_motivos` (`id`, `cita_id`, `motivo_id`, `submotivo_id`) VALUES
	(1, 1, 1, 2),
	(2, 1, 1, 2),
	(3, 2, 2, NULL);

-- Volcando datos para la tabla u330129056_picaje.citas: ~8 rows (aproximadamente)
INSERT IGNORE INTO `citas` (`id`, `centro_id`, `taller_id`, `cliente_id`, `vehiculo_id`, `asesor_id`, `origen_id`, `start_at`, `end_at`, `estado`, `reprogramada_desde_id`, `created_by`, `created_at`, `tipo_servicio`, `servicio_valet`, `fecha_promesa`, `hora_promesa`, `nota_cliente`, `nota_interna`, `orden_id`) VALUES
	(1, 2, 2, 2, NULL, 1, 1, '2026-02-09 14:00:00', '2026-02-09 14:30:00', 'confirmada', NULL, 1, '2026-02-03 04:10:39', 'PLANCHADO_PINTURA', 0, '2026-02-02', '14:00:00', 'cleinte', 'internas', NULL),
	(2, 1, 2, 2, NULL, 1, 2, '2026-02-09 08:30:00', '2026-02-09 09:00:00', 'pendiente', NULL, 1, '2026-02-03 04:11:08', 'TALLER', 0, '2026-02-02', '14:00:00', 'cleinte', 'internas', NULL),
	(3, 2, 2, 2, NULL, 1, 1, '2026-02-07 08:00:00', '2026-02-07 08:30:00', 'confirmada', 1, 1, '2026-02-09 21:54:19', 'PLANCHADO_PINTURA', 0, '2026-02-02', '14:00:00', 'cleinte', 'internas', NULL),
	(8, 1, NULL, 2, NULL, 1, NULL, '2026-02-14 21:00:00', '2026-02-14 21:30:00', 'pendiente', NULL, 1, '2026-02-14 00:03:54', 'TALLER', 0, NULL, NULL, NULL, NULL, NULL),
	(9, 1, NULL, 2, NULL, 1, NULL, '2026-02-13 19:00:00', '2026-02-13 19:30:00', 'pendiente', NULL, 1, '2026-02-14 00:04:32', 'TALLER', 0, NULL, NULL, NULL, NULL, NULL),
	(10, 1, NULL, 2, NULL, 1, NULL, '2026-02-14 19:00:00', '2026-02-14 19:30:00', 'pendiente', NULL, 1, '2026-02-14 00:49:13', 'TALLER', 0, NULL, NULL, NULL, NULL, 1),
	(11, 1, NULL, 2, NULL, 1, NULL, '2026-02-14 17:00:00', '2026-02-14 17:30:00', 'pendiente', NULL, 1, '2026-02-14 00:50:53', 'TALLER', 0, NULL, NULL, NULL, NULL, NULL),
	(12, 1, NULL, 2, NULL, 1, NULL, '2026-02-18 17:00:00', '2026-02-18 17:30:00', 'pendiente', NULL, 1, '2026-02-14 00:51:16', 'TALLER', 0, NULL, NULL, NULL, NULL, 1);

-- Volcando datos para la tabla u330129056_picaje.clases: ~3 rows (aproximadamente)
INSERT IGNORE INTO `clases` (`id`, `name`, `created_at`, `updated_at`) VALUES
	(1, 'SUV', '2026-02-20 17:21:29', '2026-02-26 00:46:41'),
	(2, 'Pick Up - 3F', '2026-02-20 22:56:51', '2026-02-26 00:47:03'),
	(5, 'Sedán', '2026-02-24 01:56:44', '2026-02-26 00:46:35');

-- Volcando datos para la tabla u330129056_picaje.clientes: ~4 rows (aproximadamente)
INSERT IGNORE INTO `clientes` (`id`, `nombre`, `apellido`, `email`, `celular`, `tipo_identificacion`, `identificacion_fiscal`, `nombre_comercial`, `created_at`) VALUES
	(1, 'DOE DOE', 'BRACHIO', 'DOE@GMAIL.COM', '51928957753', 'DNI', NULL, NULL, '2026-02-13'),
	(2, 'juan', 'ti', 'juanti@gmail.com', '987654321', 'DNI', '12345678', NULL, '2026-02-13'),
	(3, 'Paul', 'RIVERA', NULL, '51912528990', 'DNI', '75066377', NULL, '2026-02-17'),
	(5, 'Andre', 'Pariona', NULL, '51954476771', 'DNI', '43582817', NULL, '2026-02-19');

-- Volcando datos para la tabla u330129056_picaje.config_citas: ~1 rows (aproximadamente)
INSERT IGNORE INTO `config_citas` (`id`, `slot_minutes`, `updated_at`) VALUES
	(1, 30, '2026-01-17 20:47:39');

-- Volcando datos para la tabla u330129056_picaje.conversation_sessions: ~5 rows (aproximadamente)
INSERT IGNORE INTO `conversation_sessions` (`id`, `phone`, `client_id`, `state`, `context_json`, `last_intent`, `last_message_id`, `quote_id`, `vehicle_id`, `created_at`, `updated_at`) VALUES
	(1, '51912528990', 3, 'ACTIVE', '{}', 'agent_response', NULL, NULL, NULL, NULL, '2026-02-28 01:59:19'),
	(20, '51995430669', NULL, 'AWAITING_QUOTE', '{}', 'QUOTE', NULL, NULL, NULL, NULL, '2026-02-17 00:46:52'),
	(71, '51928957753', 1, 'ACTIVE', '{"lastMessage":"Y mi nissan qasqhai","lastIntent":"PROVIDE_DATA","timestamp":"2026-02-18T15:00:08.083Z"}', 'PROVIDE_DATA', NULL, NULL, NULL, NULL, '2026-02-18 15:00:08'),
	(75, '51954476771', 5, 'ACTIVE', '{}', 'agent_response', NULL, NULL, NULL, NULL, '2026-02-20 17:20:43'),
	(82, '51921512120', NULL, 'ACTIVE', '{"lastMessage":"Dónde estás","lastIntent":"ASK_LOCATION","timestamp":"2026-02-18T17:40:40.274Z"}', 'ASK_LOCATION', NULL, NULL, NULL, NULL, '2026-02-18 17:40:40');

-- Volcando datos para la tabla u330129056_picaje.cotizacion_items: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.etapas: ~21 rows (aproximadamente)
INSERT IGNORE INTO `etapas` (`id`, `nombre`, `descripcion`, `tipo`, `sort_order`, `is_active`, `created_at`) VALUES
	(1, 'Sin etapa', 'Sin etapa', 2, NULL, 1, '2026-01-15 03:33:43'),
	(4, 'Trabajando ahora', NULL, 2, 1, 1, '2026-02-15 19:25:10'),
	(5, 'Prueba de ruta', NULL, 2, 2, 1, '2026-02-15 19:26:33'),
	(6, 'Lavado', NULL, 2, 3, 1, '2026-02-15 19:26:37'),
	(7, 'Control de calidad', NULL, 2, 4, 1, '2026-02-15 19:26:51'),
	(8, 'Listo para entrega', NULL, 2, 5, 1, '2026-02-15 19:26:59'),
	(9, 'Paralizado', NULL, 2, 6, 1, '2026-02-15 19:27:21'),
	(10, 'Desmontaje mecánico', 'Desmontaje mecánico', 1, 3, 1, '2026-02-15 19:28:23'),
	(11, 'Planchado', 'Planchado', 1, NULL, 1, '2026-02-15 19:28:31'),
	(12, 'Lijado', 'Lijados', 1, 1, 1, '2026-02-15 19:28:34'),
	(13, 'Masillado', NULL, 1, 4, 1, '2026-02-15 19:28:41'),
	(14, 'Empapelado', NULL, 1, 5, 1, '2026-02-15 19:28:46'),
	(15, 'Aplicación de primer', NULL, 1, 6, 1, '2026-02-15 19:29:03'),
	(16, 'Secado de primer', NULL, 1, 7, 1, '2026-02-15 19:29:07'),
	(17, 'Pintura', NULL, 1, 8, 1, '2026-02-15 19:29:15'),
	(18, 'Secado de pintura', NULL, 1, 9, 1, '2026-02-15 19:29:20'),
	(19, 'Armado', NULL, 1, 10, 1, '2026-02-15 19:29:29'),
	(20, 'Barnizado', NULL, 1, 11, 1, '2026-02-15 19:29:33'),
	(21, 'Secado de barniz', NULL, 1, 12, 1, '2026-02-15 19:29:43'),
	(22, 'Lijado para acabado', NULL, 1, 13, 1, '2026-02-15 19:29:53'),
	(23, 'Pulido', NULL, 1, 14, 1, '2026-02-15 19:29:59');

-- Volcando datos para la tabla u330129056_picaje.horacitas_centro: ~4 rows (aproximadamente)
INSERT IGNORE INTO `horacitas_centro` (`id`, `centro_id`, `slot_minutes`, `week_json`, `created_at`, `updated_at`) VALUES
	(1, 1, 30, '{"lunes":{"active":true,"start":"08:00","end":"18:00"},"martes":{"active":true,"start":"08:00","end":"18:00"},"miercoles":{"active":true,"start":"08:00","end":"18:00"},"jueves":{"active":true,"start":"08:00","end":"18:00"},"viernes":{"active":true,"start":"08:00","end":"18:00"},"sabado":{"active":false,"start":"","end":""},"domingo":{"active":false,"start":"","end":""}}', '2026-01-28 02:33:55', '2026-02-18 14:02:05'),
	(2, 2, 30, '{"lunes":{"active":true,"start":"08:00","end":"18:00"},"martes":{"active":true,"start":"08:00","end":"18:00"},"miercoles":{"active":true,"start":"08:00","end":"18:00"},"jueves":{"active":true,"start":"08:00","end":"18:00"},"viernes":{"active":true,"start":"08:00","end":"18:00"},"sabado":{"active":false,"start":"","end":""},"domingo":{"active":false,"start":"","end":""}}', '2026-01-28 02:44:53', '2026-02-13 00:43:13'),
	(11, 4, 30, '{"lunes":{"active":true,"start":"08:00","end":"19:00"},"martes":{"active":true,"start":"08:00","end":"18:00"},"miercoles":{"active":false,"start":"","end":""},"jueves":{"active":false,"start":"","end":""},"viernes":{"active":false,"start":"","end":""},"sabado":{"active":false,"start":"","end":""},"domingo":{"active":false,"start":"","end":""}}', '2026-02-15 19:49:24', '2026-02-15 19:49:24'),
	(12, 3, 30, '{"lunes":{"active":true,"start":"08:00","end":"18:00"},"martes":{"active":false,"start":"","end":""},"miercoles":{"active":false,"start":"","end":""},"jueves":{"active":false,"start":"","end":""},"viernes":{"active":false,"start":"","end":""},"sabado":{"active":true,"start":"08:00","end":"18:00"},"domingo":{"active":true,"start":"08:00","end":"18:00"}}', '2026-02-16 18:22:31', '2026-02-16 18:24:43');

-- Volcando datos para la tabla u330129056_picaje.mantenimiento: ~7 rows (aproximadamente)
INSERT IGNORE INTO `mantenimiento` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`, `mantenimiento_id`) VALUES
	(1, '3. Preventivo', 'Es la Revisión Express + el cambio de:\n*Aceite de caja,\n*Aceite de transmisión,\n*Bujías,\n*Cadena de distribución,\n*Faja de accesorios,\n*Filtro de aire,\n*Filtro de A/C,\n*Filtro de combustible,\n*Fluido de caja,\n*Fluido de diferencial,\n*Limpiador de freno,\n*Líquido de freno,\n*Refrigerante,\n*Shampoo o según corresponda al manual del fabricante\n*El tiempo de trabajo es aproximadamente 5 hrs', 1, '2026-02-14 17:12:53', '2026-02-26 20:34:10', NULL),
	(2, '1. Básico', 'Consiste en:\n*Cambio de filtro de motor, \n*Aceite de motor, \n*Arandela.\n*De cortesía es el lavado exterior y el escaneo. \n*El tiempo de trabajo es aproximadamente 1.5 hrs', 1, '2026-02-15 04:10:31', '2026-02-26 20:28:21', NULL),
	(3, '4. Premium', 'Es el Mantenimiento Preventivo + cambio o corrección de:\n*Alineamiento y balanceo electrónico,\n*Aditivo de motor,\n*Aditivo de combustible,\n*Sanitización de ductos de ventilación\n*El tiempo de trabajo es aproximadamente 6 hrs', 1, '2026-02-15 04:10:36', '2026-02-26 20:37:32', '1'),
	(4, '5. Exclusivo', 'Es el Mantenimiento Preventivo + cambio o corrección de:\n*Lavado de salón,\n*Aros pintados,\n*Seguro de aros,\n*Pulido de faros,\n*Recojo y entrega a domicilio\n*El tiempo de trabajo es aproximadamente 5 días', 1, '2026-02-15 04:10:42', '2026-02-26 20:39:34', '3,1'),
	(5, '6. Alto Rendimiento', 'Es el Mantenimiento Preventivo + cambio o corrección de:\n*Undercoating + zincado,\n*Pulido general,\n*2 paños de pintura.\n*Laminado,\n*El tiempo de trabajo es aproximadamente 9 días', 1, '2026-02-15 04:10:49', '2026-02-26 20:43:45', '1,3,4'),
	(10, '2. Revisión Express', 'Se revisa:\n*La iluminación frontal,\n*La iluminación posterior,\n*Niveles de fluidos,\n*Compartimiento del motor,\n*Frenos,\n*Suspensión,\n*Ejes,\n*Escaneo\n*El tiempo de trabajo es aproximadamente 1 hr', 1, '2026-02-25 20:20:12', '2026-02-26 20:31:18', NULL),
	(11, 'Servicios adicionales', '', 1, '2026-02-25 20:30:17', '2026-02-25 20:30:17', NULL);

-- Volcando datos para la tabla u330129056_picaje.marcas: ~16 rows (aproximadamente)
INSERT IGNORE INTO `marcas` (`id`, `name`, `image_url`, `created_at`) VALUES
	(3, 'TOYOTA', 'https://www.diariomotor.com/imagenes/2022/11/logo-de-toyota-6376f7ae393e5.jpg?class=XL', '2026-01-23 22:32:11'),
	(5, 'Hyundai', NULL, '2026-02-14 03:41:59'),
	(6, 'Kia', NULL, '2026-02-14 03:41:59'),
	(7, 'Nissan', 'data:image/jpeg;base64,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', '2026-02-14 03:41:59'),
	(8, 'Chevrolet', NULL, '2026-02-14 03:41:59'),
	(9, 'Mazda', NULL, '2026-02-14 03:41:59'),
	(10, 'Honda', NULL, '2026-02-14 03:41:59'),
	(11, 'Suzuki', NULL, '2026-02-14 03:41:59'),
	(12, 'Mitsubishi', NULL, '2026-02-14 03:41:59'),
	(13, 'Volkswagen', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1280px-Volkswagen_logo_2019.svg.png', '2026-02-14 03:41:59'),
	(14, 'Ford', 'https://interamericananorte.com/storage/brands/uX4duGKa952Bt58YfLrcD5NXbNWebMtnAAzGakDo.png', '2026-02-14 03:41:59'),
	(15, 'Renault', NULL, '2026-02-14 03:41:59'),
	(16, 'Jeep', NULL, '2026-02-14 03:41:59'),
	(17, 'BMW', NULL, '2026-02-14 03:41:59'),
	(18, 'Mercedes-Benz', NULL, '2026-02-14 03:41:59'),
	(19, 'Audi', NULL, '2026-02-14 03:41:59');

-- Volcando datos para la tabla u330129056_picaje.modelos: ~33 rows (aproximadamente)
INSERT IGNORE INTO `modelos` (`id`, `marca_id`, `clase_id`, `name`, `anios`, `created_at`) VALUES
	(2, 3, NULL, 'frontier', NULL, '2026-02-12 20:01:11'),
	(3, 7, NULL, 'Sentra', NULL, '2026-02-14 14:48:16'),
	(4, 7, 1, 'Qashqai', NULL, '2026-02-14 14:48:31'),
	(5, 7, NULL, 'Xtrail', NULL, '2026-02-14 14:57:08'),
	(6, 15, NULL, 'Duster', NULL, '2026-02-14 14:57:40'),
	(7, 7, NULL, 'Urvan', NULL, '2026-02-17 00:13:41'),
	(10, 8, 1, 'N400', NULL, '2026-02-20 16:41:06'),
	(11, 8, 1, 'Captiva', NULL, '2026-02-26 00:50:49'),
	(12, 8, 2, 'Colorado', NULL, '2026-02-26 00:51:05'),
	(13, 8, 1, 'Groove', NULL, '2026-02-26 00:51:32'),
	(14, 8, 2, 'Montana', NULL, '2026-02-26 00:52:03'),
	(15, 8, 5, 'Onix', NULL, '2026-02-26 00:52:34'),
	(16, 8, 5, 'Sail', NULL, '2026-02-26 00:52:41'),
	(17, 8, 5, 'Spark', NULL, '2026-02-26 00:52:59'),
	(18, 8, 2, 'Tahoe', NULL, '2026-02-26 00:53:11'),
	(19, 8, 1, 'Tracker', NULL, '2026-02-26 00:53:23'),
	(20, 14, 1, 'Bronco', NULL, '2026-02-26 00:54:08'),
	(21, 14, 1, 'Ecosport', NULL, '2026-02-26 00:54:22'),
	(22, 14, 1, 'Escape', NULL, '2026-02-26 00:54:38'),
	(23, 14, 2, 'Expedition', NULL, '2026-02-26 00:54:48'),
	(24, 14, 2, 'Explorer', NULL, '2026-02-26 00:55:03'),
	(25, 14, 2, 'Ranger', NULL, '2026-02-26 00:55:13'),
	(26, 14, 1, 'Territory', NULL, '2026-02-26 00:55:25'),
	(27, 14, 2, 'Maverick', NULL, '2026-02-26 00:55:59'),
	(28, 14, 2, 'F150', NULL, '2026-02-26 00:56:07'),
	(29, 14, 5, 'Mustang', NULL, '2026-02-26 00:56:24'),
	(30, 13, 5, 'Crossfox', NULL, '2026-02-26 00:57:53'),
	(31, 13, 1, 'Tiguan', NULL, '2026-02-26 00:58:10'),
	(32, 13, 2, 'Amarok', NULL, '2026-02-26 00:58:30'),
	(33, 13, 5, 'Gol', NULL, '2026-02-26 00:58:48'),
	(34, 13, 2, 'Saveiro', NULL, '2026-02-26 00:59:02'),
	(35, 13, 1, 'Taos', NULL, '2026-02-26 00:59:29'),
	(36, 13, 1, 'T-Cross', NULL, '2026-02-26 00:59:56');

-- Volcando datos para la tabla u330129056_picaje.mostradores: ~3 rows (aproximadamente)
INSERT IGNORE INTO `mostradores` (`id`, `centro_id`, `nombre`, `created_at`) VALUES
	(1, 1, 'Mostrador esquina', '2026-02-08 02:50:27'),
	(2, 3, 'mostrador chiclayo', '2026-02-16 02:11:58'),
	(4, 1, 'Mostrador repuestera', '2026-02-21 13:44:51');

-- Volcando datos para la tabla u330129056_picaje.motivos_citas: ~5 rows (aproximadamente)
INSERT IGNORE INTO `motivos_citas` (`id`, `nombre`, `is_active`, `created_at`) VALUES
	(2, 'Reparación', 1, '2026-02-01 01:19:58'),
	(3, 'Mantenimiento', 0, '2026-02-18 02:55:26'),
	(4, 'Campaña/ Promoción', 0, '2026-02-21 13:46:11'),
	(5, 'Diagnóstico', 1, '2026-02-26 20:58:06'),
	(6, 'Garantía/Recall', 1, '2026-02-26 20:58:30');

-- Volcando datos para la tabla u330129056_picaje.orden_archivos: ~1 rows (aproximadamente)
INSERT IGNORE INTO `orden_archivos` (`id`, `orden_id`, `url`, `tipo`, `descripcion`, `created_at`, `cotizacion_item_id`) VALUES
	(1, 1, '/uploads/76fd5734-482c-4418-869d-74e81e9fc4f9.jpeg', 'IMAGE', '', '2026-02-14 00:28:41', NULL);

-- Volcando datos para la tabla u330129056_picaje.ordenes: ~1 rows (aproximadamente)
INSERT IGNORE INTO `ordenes` (`id`, `cliente_id`, `vehiculo_id`, `tipo_servicio`, `etapa`, `estado`, `total_estimado`, `created_at`, `updated_at`) VALUES
	(1, 2, 2, 'MECHANIC', 'RECEPCION', 'PENDIENTE', 0.00, '2026-02-13 23:58:39', '2026-02-18 02:03:32');

-- Volcando datos para la tabla u330129056_picaje.origenes_citas: ~5 rows (aproximadamente)
INSERT IGNORE INTO `origenes_citas` (`id`, `name`, `is_active`, `created_at`) VALUES
	(1, 'Facebook', 1, '2026-01-26 03:56:29'),
	(2, 'Visita', 1, '2026-01-27 04:33:07'),
	(3, 'Tik tok', 1, '2026-02-15 19:48:44'),
	(4, 'Referido', 1, '2026-02-15 19:48:52'),
	(5, 'Enlace', 1, '2026-02-15 19:49:02');

-- Volcando datos para la tabla u330129056_picaje.precios: ~64 rows (aproximadamente)
INSERT IGNORE INTO `precios` (`id`, `mantenimiento_id`, `submantenimiento_id`, `marca_id`, `modelo_id`, `precio`) VALUES
	(1, 1, 2, 8, 10, 40.00),
	(3, 1, 2, 7, 4, 40.00),
	(5, 1, 2, 7, 3, 1.00),
	(9, 1, 2, 3, 2, 10.00),
	(13, 1, 2, 7, 7, 10.00),
	(15, 1, 2, 15, 6, 10.00),
	(17, 1, 2, 7, 5, 10.00),
	(21, 1, 2, 8, 11, 40.00),
	(23, 1, 2, 8, 13, 40.00),
	(24, 1, 2, 14, 22, 40.00),
	(25, 1, 2, 14, 26, 40.00),
	(27, 1, 2, 13, 36, 40.00),
	(28, 1, 2, 13, 35, 40.00),
	(29, 1, 2, 13, 31, 40.00),
	(31, 1, 2, 8, 19, 40.00),
	(33, 1, 2, 14, 21, 40.00),
	(34, 1, 2, 14, 20, 40.00),
	(45, 1, 2, 8, 12, 30.00),
	(46, 1, 2, 8, 14, 30.00),
	(47, 1, 2, 8, 18, 30.00),
	(48, 1, 2, 14, 23, 30.00),
	(49, 1, 2, 14, 24, 30.00),
	(50, 1, 2, 14, 28, 30.00),
	(51, 1, 2, 14, 27, 30.00),
	(52, 1, 2, 14, 25, 30.00),
	(53, 1, 2, 13, 32, 30.00),
	(54, 1, 2, 13, 34, 30.00),
	(65, 1, 2, 8, 15, 10.00),
	(66, 1, 2, 8, 17, 10.00),
	(67, 1, 2, 8, 16, 10.00),
	(68, 1, 2, 14, 29, 10.00),
	(69, 1, 2, 13, 33, 10.00),
	(70, 1, 2, 13, 30, 10.00),
	(77, 3, 13, 8, 11, 100.00),
	(79, 3, 13, 8, 12, 40.00),
	(81, 3, 13, 8, 13, 100.00),
	(84, 3, 13, 8, 14, 200.00),
	(87, 3, 13, 15, 6, 100.00),
	(90, 3, 4, 15, 6, 130.00),
	(93, 3, 14, 15, 6, 150.00),
	(96, 4, 5, 15, 6, 420.00),
	(99, 4, 15, 15, 6, 360.00),
	(102, 4, 17, 15, 6, 180.00),
	(105, 4, 18, 15, 6, 500.00),
	(108, 4, 16, 15, 6, 600.00),
	(111, 5, 19, 15, 6, 650.00),
	(114, 5, 20, 15, 6, 750.00),
	(117, 5, 7, 15, 6, 570.00),
	(120, 5, 6, 15, 6, 890.00),
	(123, 11, 21, 15, 6, 590.00),
	(128, 11, 26, 15, 6, 690.00),
	(131, 11, 22, 15, 6, 700.00),
	(134, 11, 23, 15, 6, 750.00),
	(137, 11, 24, 15, 6, 780.00),
	(140, 11, 25, 15, 6, 900.00),
	(143, 1, 31, 15, 6, 10.00),
	(145, 1, 1, 15, 6, 10.00),
	(147, 1, 10, 15, 6, 10.00),
	(149, 1, 11, 15, 6, 10.00),
	(151, 1, 12, 15, 6, 10.00),
	(153, 1, 27, 15, 6, 10.00),
	(155, 1, 28, 15, 6, 10.00),
	(157, 1, 29, 15, 6, 10.00),
	(159, 1, 30, 15, 6, 10.00);

-- Volcando datos para la tabla u330129056_picaje.processed_messages: ~103 rows (aproximadamente)
INSERT IGNORE INTO `processed_messages` (`id`, `message_id`, `phone`, `processed_at`) VALUES
	(1, 'wamid.testXYZ', '51912528990', NULL),
	(2, 'wamid.20260215134723', '51912528990', NULL),
	(3, 'wamid.NEW88562', '51912528990', NULL),
	(4, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0IyNTZGRUU4RUNDMDBCMkQ5RjNGNUE3RkY0Njg5MgA=', '51912528990', NULL),
	(5, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzY5NTZCM0Y2RTZGMjlEOEU2OTgzQjU1NDQ2NjFBNAA=', '51912528990', NULL),
	(6, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0U1M0E0RDc2MTY1MDBBRDFFM0U1NjI5RkNDOTBCNQA=', '51912528990', NULL),
	(7, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzk4RjU1NzU3OEFFNEY4OUJDNDU0OEExNjMzM0MzMQA=', '51912528990', NULL),
	(8, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzJCNzI4QjQ3OUQ4MzIxRDc1MjlGMzA4QUY2RTcwMQA=', '51912528990', NULL),
	(9, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0M2NTQ3MUE2NzU5MzJGRkY5MUVDMzM2OUE5QTIyMgA=', '51912528990', NULL),
	(10, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzYwRjJDOTQ2OTI3RTE5NEE4REZFOThGQzBGRjIzQQA=', '51912528990', NULL),
	(11, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzI2QjBFRkQ0MEI1Q0E4MUQ3MTRCRkJGQTY0MEEwQQA=', '51912528990', NULL),
	(12, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0YzQjNEMjVGMDg5OUEwRjk3QkQzNzZFM0ZFM0ZBNgA=', '51912528990', NULL),
	(13, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzgwQzdCRkFFMzExMjk0MDFGMjVFNzIxNTg3NDQzOQA=', '51912528990', NULL),
	(14, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Q0QTEzODRBQ0JCOTg2MzhGMzVCQ0E2RDE1RjY2MwA=', '51912528990', NULL),
	(15, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0FFODkxQjA3QUU5MDdFODc4QkNBRUU0OTQwRTg5RgA=', '51912528990', NULL),
	(16, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzYyRjgwMjg1M0U1N0ZBREUxMkIyMzQyN0Y1NUZCQgA=', '51912528990', NULL),
	(17, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGBYzRUIwN0I0MzIyQUI1N0JGRTFCOTUzAA==', '51912528990', NULL),
	(18, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzQwQjU3NkM0OUEzMkQ5RkFEMEI5RUUwMEYyQjg5QwA=', '51912528990', NULL),
	(19, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzdBN0YxRTg2NEE3RkJBN0NBNzkzNTM5Mjk3ODkzQwA=', '51912528990', NULL),
	(20, 'wamid.HBgLNTE5OTU0MzA2NjkVAgASGCBBQ0ZFQUY1MkYwQzlCOTJDMUVFMEJEM0FGRUVGNzRCNQA=', '51995430669', NULL),
	(21, 'wamid.HBgLNTE5OTU0MzA2NjkVAgASGCBBQzcyODFFN0REMTlFOTMzNzFFRTBBMEI1MjNCQzc5NAA=', '51995430669', NULL),
	(22, 'wamid.HBgLNTE5OTU0MzA2NjkVAgASGCBBQ0U4ODA5QTA4OTE2MUZBQzM0MEM5OEU2NDYwNTJDQwA=', '51995430669', NULL),
	(23, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzY0QUY5RUNEQTBBMzZEMzQ4MUQyMzc4QzQyMDM1RQA=', '51912528990', NULL),
	(24, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0YwOTYwRkUzQjg4NjkyMzkxNTAyQzNGQThFMjBDNwA=', '51912528990', NULL),
	(25, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0RFRTgzNTM1OEZEQUU5MjJFRjQ4QzdCQTJDODQ2NgA=', '51912528990', NULL),
	(26, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzk0MUE5NkMxMzJGQjY0OTk2NEVBODU2MEY3NTlDOQA=', '51912528990', NULL),
	(27, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzZBMjAzODY5NzYxMDMwMkM2OENFMDNENkM0NUZBMQA=', '51912528990', NULL),
	(28, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzNDRjM2QUM1MDM2NEQxMDFBQTk3NzE5QkU5REJEOAA=', '51912528990', NULL),
	(29, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0I2NDQ2N0Q5QUI2OThGNjFFMDREMjVDQkYzRjBFMQA=', '51912528990', NULL),
	(30, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzBFOTRCRTg1MjZDNDM1MkQyNjE1NkE3N0I1M0RDOAA=', '51912528990', NULL),
	(31, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzhDNTk0OUUzQzEzQTZCODQxMEY1RUI0NDA5N0MzNQA=', '51912528990', NULL),
	(32, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzc2RTI0NEY2QzY0NTlEMUNGQTdCODc5NDBEQUQxRAA=', '51912528990', NULL),
	(33, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzJCOUFBRkVEREY0RkIwMEJGRTM1MUU0NDBBNDQ5QgA=', '51912528990', NULL),
	(34, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzlBMDJFQ0M0NTlCOUZEQUUzNzFFOUQ0Rjk0RDZFMwA=', '51912528990', NULL),
	(35, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzUwMTk0N0QyMkM0RjI0RDMyNzIzODU1NTdCOUJDMQA=', '51912528990', NULL),
	(36, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzcyRUFGNDY1MDgxQjcwMDJGRDVGRTk5NjNDOUNCNAA=', '51912528990', NULL),
	(37, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0UwQkVENDAwQTc0QkE3RTIwNzI5QkY1RkI0Qjg3NwA=', '51912528990', NULL),
	(38, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0ExMjFCOTkzM0VFOUNFNUY4Rjg5OTEyN0Q5MDEwNAA=', '51912528990', NULL),
	(39, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzcxRDQwRjJFQjYyN0JGRjk5NTY3MkRBOEExNjkwOAA=', '51912528990', NULL),
	(40, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzM4NTg4QTg4NTQyMDE0NjMxNEM4NDY2M0U3OTk3QwA=', '51912528990', NULL),
	(41, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzM2QzEzQUY2MTZGQTJEQTY0MkRBQUNFNEMwOTE2OAA=', '51912528990', NULL),
	(42, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzMxMEM5OUI0RDJFOTEyNjczMzA5RkVCNkJENTAwNgA=', '51912528990', NULL),
	(43, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzc4MzkwMUQ2RkU1QTQ5OTg1N0MxNjQ3QUY1NTc5RQA=', '51912528990', NULL),
	(44, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzA2NEY4RkIxQkEyQzczQzU5ODEwQzdFOTdCMjNFNgA=', '51912528990', '2026-02-18 00:26:55'),
	(45, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0NFODU2MTZFMUNDNDE5MUE3QUExQTBGQTBDQzgyQwA=', '51912528990', '2026-02-18 00:27:26'),
	(46, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0M1MjU2MThDNTcyQzlEOUY3NjQ3MDRCMTcwQjlBQgA=', '51912528990', '2026-02-18 00:28:18'),
	(47, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0QxNENDNDNBNUUwMzY4RDAzMUQyOTAwMTBGMzYwQwA=', '51912528990', '2026-02-18 00:31:30'),
	(48, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzE5OTNDOUMyQTVGOUQyRTlGNDA5MjI1NURDNzYxNQA=', '51912528990', '2026-02-18 00:32:08'),
	(49, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzEzQkRBMjM4MThENkM0MTE1RkZCMUIwMEUxQjI4QwA=', '51912528990', '2026-02-18 00:32:42'),
	(50, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0REQTM2REY5QkJDOEEwMjMwNTM3NkNDRUQ5REUwMwA=', '51912528990', '2026-02-18 01:04:45'),
	(51, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0JGMDYyMDZEODYzMkRERDExRTY5QkNBQzEyNjYwMQA=', '51912528990', '2026-02-18 01:05:36'),
	(52, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Q2QjQwRjRDQzJEQjBFNDdCMjg1MEU2NkJEMDFEQgA=', '51912528990', '2026-02-18 01:06:13'),
	(53, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzY0MjQxOUUxQzA5N0QwNjdDQkIyNTUzMEY5QTMxMQA=', '51912528990', '2026-02-18 01:07:19'),
	(54, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0E0NEVFRURFMjQ0Mzc5MzdEQkU1OEQzQkQyOEEwNQA=', '51912528990', '2026-02-18 01:07:51'),
	(55, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzRCQjNGMEQwMDQ0QkYxREQyQ0E1RDU2ODY0MzY0RAA=', '51912528990', '2026-02-18 01:08:37'),
	(56, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Y0MENGNUQ0OENCMjU2RjgzMzQ2M0ZCOEJDMURENAA=', '51912528990', '2026-02-18 01:09:15'),
	(57, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzZDMDU2QkZCREJCNEM0MjAyN0E3RjI4NkJFNDhDNwA=', '51912528990', '2026-02-18 01:09:36'),
	(58, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0E2MEZCN0FEQUUwMUEwQ0VCRTAzMTY0MzU3RTA2NQA=', '51912528990', '2026-02-18 01:10:35'),
	(59, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzQxMzJDOTNCMDEyRDc4OEEyMUFFODBDQjdCNTRFMwA=', '51912528990', '2026-02-18 02:56:53'),
	(60, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzU4M0Q1RDJBMzIxMkRBQzg5Q0JGRUJEN0FBMDhCMwA=', '51912528990', '2026-02-18 03:00:48'),
	(61, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzMxNUYyMjNGQTEwQzRGMkFFMzZGQTZCNTBBMkI1NAA=', '51912528990', '2026-02-18 03:01:25'),
	(62, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzk3QTIzRjRFM0RDRjMxOEQ2QTBBNkVCOEQ5RkZFQQA=', '51912528990', '2026-02-18 03:02:08'),
	(63, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0YzNDZBNjdGRDg2RjQ2MzVDMDhGMzc1QTJEOTBDRAA=', '51912528990', '2026-02-18 03:26:12'),
	(64, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzY4QUIwNzM2MTBCMUEzRTI5NTY1RURDRjgzRkFEOQA=', '51912528990', '2026-02-18 03:26:39'),
	(65, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzRFODkzQzM3Qjc3QTMxQUUzMDgyRTYxMjNCQ0VGNgA=', '51912528990', '2026-02-18 03:46:16'),
	(66, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzk1QzMxQzIzQjYyNzdEMDQ0MTA1N0E5RTM2OTZBOQA=', '51912528990', '2026-02-18 03:47:00'),
	(67, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzg5QzkxMzI0OUI4M0NBMDg0N0M3ODVFNkEzNzQzNAA=', '51912528990', '2026-02-18 03:47:26'),
	(68, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzk4MDA2OEY3NzhGRUE5Njg3MkEzOTA1NjMwRUY5MwA=', '51912528990', '2026-02-18 03:55:36'),
	(69, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0NGNjY2Qzg2OTBEQTM0OTYxOEU2OEE0ODFCMTA0OAA=', '51912528990', '2026-02-18 03:59:30'),
	(70, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Y3OTlCNDM0MzA3OEQwODg2OUQ5QzhENUNCMDgzNwA=', '51912528990', '2026-02-18 04:22:37'),
	(71, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0NCRTc4MDJEMEU3QjlFMEVERkIzQThDNkQwQzcyRgA=', '51912528990', '2026-02-18 04:23:13'),
	(72, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzAxREFEMUQyQzU1MDYwRDM3MkQ5OEY2RkVCQzA1MwA=', '51912528990', '2026-02-18 04:24:09'),
	(73, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Y2MkQ4MDE3MTZBNTM2MkU4NTk1NzNENUFGQTdDRQA=', '51912528990', '2026-02-18 04:24:41'),
	(74, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0QwNzhFNTUyRjdCQUM2OUE5ODNFQTI5QUJCNTA1QQA=', '51912528990', '2026-02-18 04:26:26'),
	(75, 'wamid.HBgLNTE5Mjg5NTc3NTMVAgASGCBBQ0M0OEU2OUQwNTZCNUNCNUMxRTA1Q0E1OUMzQTAxQwA=', '51928957753', '2026-02-18 14:56:17'),
	(76, 'wamid.HBgLNTE5Mjg5NTc3NTMVAgASGCBBQzY4OEI5MzUzNjdEMTUyMUQxNTc5Mjk4MDc2MjM1MQA=', '51928957753', '2026-02-18 14:56:37'),
	(77, 'wamid.HBgLNTE5Mjg5NTc3NTMVAgASGCBBQ0YzRTRFNEVGMjY0M0Y1OEEyOUNEMDZFODQ5OEZERQA=', '51928957753', '2026-02-18 14:59:31'),
	(78, 'wamid.HBgLNTE5Mjg5NTc3NTMVAgASGCBBQzkzOEM4MTlBMjQzNDE3RjI2Q0Q5MEJBM0ZDQjhBNAA=', '51928957753', '2026-02-18 15:00:01'),
	(79, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwNEQ1NkJGRTlEQjNFQ0VENTU4AA==', '51954476771', '2026-02-18 15:11:33'),
	(80, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwRTY4NzMwNTU5RjBEM0IzRTc1AA==', '51954476771', '2026-02-18 15:12:25'),
	(81, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwNUE4NTVFOTYxQTE1M0JCNzM0AA==', '51954476771', '2026-02-18 15:12:54'),
	(82, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwQ0Y3QjZENTdDQTIxMUJFMzg5AA==', '51954476771', '2026-02-18 15:13:25'),
	(83, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwNDc4NDIzMzJCMDhBNTk1QUYyAA==', '51954476771', '2026-02-18 15:13:48'),
	(84, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwMjc3MERGRkY4OTlGQjFEQ0E0AA==', '51954476771', '2026-02-18 15:14:07'),
	(85, 'wamid.HBgLNTE5NTQ0NzY3NzEVAgASGBYzRUIwODhCRjJDQkRFMjJDN0Q1MUQzAA==', '51954476771', '2026-02-18 15:14:28'),
	(86, 'wamid.HBgLNTE5MjE1MTIxMjAVAgASGCBBQzhDNjYxNDc3MzZDQ0QxN0VDQkM5MkVFODlCNzg1RgA=', '51921512120', '2026-02-18 17:40:23'),
	(87, 'wamid.HBgLNTE5MjE1MTIxMjAVAgASGCBBQzM5Q0M1NEU0QTg1MDE3MzZDQ0RBRDk2QTEwMDZFMwA=', '51921512120', '2026-02-18 17:40:34'),
	(88, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0Y1QjZGM0U3MDU4MEJBNEU0OTUwMDFDRjIxNjNCRAA=', '51912528990', '2026-02-19 14:43:24'),
	(89, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzUwREMwNDU1NEMwMzVENzY0MzQwRjRBQTNGN0UwNQA=', '51912528990', '2026-02-19 14:44:04'),
	(90, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0ZGOUM1M0NFMTExMjcwMjVCQzBDRkUzMzU5NUIxOAA=', '51912528990', '2026-02-19 14:45:14'),
	(91, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzY3OEVFNEQ2RkRGNjlEOEFDNEMwMkEwMjA1MDMzQwA=', '51912528990', '2026-02-19 14:46:13'),
	(92, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzlBM0UwQzE0NDVGNENCRkJFNERENkFCNEY4NUVCNAA=', '51912528990', '2026-02-19 14:51:20'),
	(93, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0NFNUQ0Mjg1NzdBRTM1QzYzNTI4MEJERDFFMTRBRAA=', '51912528990', '2026-02-19 15:20:17'),
	(94, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzRENjc2RDIyNjRBNzIyOUM3MjYzMzQ4ODFFN0IwNgA=', '51912528990', '2026-02-19 15:27:26'),
	(95, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzE0RDQ1RTA1MTg4MEZFQTM2MjQ0MjgyMEU5MkM0MgA=', '51912528990', '2026-02-19 15:27:48'),
	(96, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0NGQ0NBRTBFODA5RkRCMEJGODYzQjk2MURCODg2NwA=', '51912528990', '2026-02-19 15:28:37'),
	(97, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0I0RTEzQTUzRkJFRUFDMzBGMURFMTMzRUNEQjIwRQA=', '51912528990', '2026-02-19 15:43:19'),
	(98, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzA5NDI3QTZGODEyNkJENTk3NjAzOTk0MzU2NEFENgA=', '51912528990', '2026-02-19 15:43:44'),
	(99, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzM0Q0FDMjk3RTMyNjU4NTlEQjY0RENDNzE4QURGQQA=', '51912528990', '2026-02-19 15:44:09'),
	(100, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzA5NUE4OEREQ0Y0Njk2MkYxQ0VDNERDN0JGRTkzOQA=', '51912528990', '2026-02-19 15:44:59'),
	(101, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQzM5MDY4NDRFODExMTY2QTQ3MTM3Rjg0RTk0QUUxNwA=', '51912528990', '2026-02-19 15:46:34'),
	(102, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0JCNjk1OTkzQUE1NDZBQjM2OEI4QjYyRkYyQkQ1RgA=', '51912528990', '2026-02-19 15:58:37'),
	(103, 'wamid.HBgLNTE5MTI1Mjg5OTAVAgASGCBBQ0YyRjJCMDM3MDE1NEMzQzNGRjlCOENGOURDRENGNwA=', '51912528990', '2026-02-19 15:59:16');

-- Volcando datos para la tabla u330129056_picaje.productos: ~1 rows (aproximadamente)
INSERT IGNORE INTO `productos` (`id`, `numero_parte`, `descripcion`, `fecha_ingreso`, `stock_total`, `stock_usado`, `stock_disponible`, `precio_compra`, `precio_venta`, `created_at`) VALUES
	(1, '2T2121003', 'bomba de agua', '2026-02-08', 10, 0, 10, 12.10, 16.70, '2026-02-08 03:40:19');

-- Volcando datos para la tabla u330129056_picaje.recepcion_audios: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.recepcion_fotos: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.recepcion_videos: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.recepciones: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.reminders: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.roles: ~5 rows (aproximadamente)
INSERT IGNORE INTO `roles` (`id`, `name`, `permissions`, `created_at`, `description`) VALUES
	(1, 'Admin', '{"all": true}', '2026-01-12 03:51:36', 'Acceso a todo'),
	(2, 'Operador', '{"home": {"edit": false, "view": false, "create": false, "delete": false}, "citas": {"edit": false, "view": false, "create": false, "delete": false}, "roles": {"edit": false, "view": true, "create": true, "delete": false}, "carros": {"edit": false, "view": false, "create": false, "delete": false}, "etapas": {"edit": false, "view": false, "create": false, "delete": false}, "marcas": {"edit": false, "view": false, "create": false, "delete": false}, "picaje": {"edit": false, "view": true, "create": false, "delete": false}, "modelos": {"edit": false, "view": false, "create": false, "delete": false}, "ordenes": {"edit": false, "view": false, "create": false, "delete": false}, "clientes": {"edit": false, "view": false, "create": false, "delete": false}, "reportes": {"edit": false, "view": true, "create": false, "delete": false}, "usuarios": {"edit": true, "view": true, "create": false, "delete": true}, "cotizacion": {"edit": false, "view": false, "create": false, "delete": false}, "inventario": {"edit": false, "view": true, "create": false, "delete": false}, "configuracion": {"edit": false, "view": false, "create": false, "delete": false}, "tiposactividades": {"edit": false, "view": true, "create": true, "delete": false}}', '2026-01-13 19:56:13', NULL),
	(3, 'ASESOR', '{"citas": ["read", "create", "update"], "clientes": ["read", "create", "update"], "ordenes": ["read", "create"]}', '2026-02-14 15:03:43', 'Asesor de servicio'),
	(4, 'TECNICO', '{"ordenes": ["read", "update"], "vehiculos": ["read"]}', '2026-02-14 15:03:43', 'Técnico de taller'),
	(5, 'BOT', '{"citas": ["read", "create"], "clientes": ["read", "create", "update"], "vehiculos": ["read", "create"]}', '2026-02-14 15:03:43', 'Agente automatizado');

-- Volcando datos para la tabla u330129056_picaje.service_packages: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.service_prices: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.session_locks: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.stock_parcial: ~1 rows (aproximadamente)
INSERT IGNORE INTO `stock_parcial` (`id`, `producto_id`, `centro_id`, `taller_id`, `mostrador_id`, `stock`, `created_at`) VALUES
	(4, 1, NULL, NULL, NULL, 1, '2026-02-13 03:07:12');

-- Volcando datos para la tabla u330129056_picaje.submantenimiento: ~28 rows (aproximadamente)
INSERT IGNORE INTO `submantenimiento` (`id`, `name`, `description`, `type_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, '2° Mantenimiento', NULL, 1, 1, '2026-02-14 18:01:53', '2026-02-20 15:32:41'),
	(2, '1° Mantenimiento', '', 1, 1, '2026-02-13 04:09:44', '2026-02-26 20:55:27'),
	(4, 'Alineamiento y Balanceo electrónico', 'El alineamiento ajusta los ángulos de las ruedas para que estén paralelas y perpendiculares al suelo, asegurando un rodaje recto y reduciendo el desgaste; mientras que el balanceo distribuye uniformemente el peso de la llanta y el rin, eliminando vibraciones y protegiendo la suspensión, mejorando ambos la seguridad, el confort y la vida útil de los neumáticos', 3, 1, '2026-02-15 04:12:39', '2026-02-25 20:35:10'),
	(5, 'Lavado de salón', 'Consiste en:\n*Limpieza de alfombra. \n*Limpieza de asientos. \n*Limpieza de techo. \n*Limpieza de cinturón de seguridad. \n*Limpieza y descontaminado de piezas plásticas. \n*Limpieza de ductos de aire acondicionado. \n*Acondicionado de superficies plásticas en white o mate. \n*Aplicación de aroma\n*El tiempo aproximado de trabajo es de 1 día', 4, 1, '2026-02-15 04:12:53', '2026-02-26 20:54:43'),
	(6, 'Undercoating + Zincado', 'El undercoating es una capa protectora anticorrosiva que se aplica en la parte baja del chasis para aislarlo de humedad, sal y golpes de piedras, reduciendo ruido y vibraciones; mientras que el zincado es un proceso donde una pieza de metal (como el tubo de escape) se recubre con una capa de zinc para prevenir la oxidación.', 5, 1, '2026-02-15 04:13:05', '2026-02-25 20:54:48'),
	(7, 'Pulido general', 'Es un proceso de acabado automotriz que elimina imperfecciones como rayones superficiales, oxidación, manchas y marcas de remolino de la pintura', 5, 1, '2026-02-15 04:13:12', '2026-02-25 20:53:41'),
	(10, '3° Mantenimiento', NULL, 1, 1, '2026-02-20 15:32:49', '2026-02-20 15:32:49'),
	(11, '4° Mantenimiento', NULL, 1, 1, '2026-02-20 15:32:54', '2026-02-20 15:32:54'),
	(12, '5° Mantenimiento', NULL, 1, 1, '2026-02-20 15:33:01', '2026-02-20 15:33:01'),
	(13, 'Aditivo de motor y de combustible', 'Es para una limpieza profunda interna del motor generando carbonilla y existen aditivos para vehículos gasolineros y petroleros', 3, 1, '2026-02-20 15:34:55', '2026-02-25 20:29:30'),
	(14, 'Sanitización de ductos de ventilación', 'Es una tecnología que purifica el aire y las superficies dentro de vehículos y ambientes cerrados, eliminando hasta el 99.99% de virus, bacterias, hongos y malos olores, sin usar químicos, mediante la generación de especies reactivas de oxígeno (ROS) a través de un plasma no térmico, creando un aire limpio y seguro para la salud.', 3, 1, '2026-02-20 15:35:23', '2026-02-25 20:54:18'),
	(15, 'Pintura de los 4 aros', 'Estética y personalización; cambiar el diseño y color para que el auto luzca único y deportivo (tuning). Daño estructural; si están doblado, agrietados o deformados por baches o golpes. Desgaste excesivo; bordes afilados o superficies irregulares por golpes o mal montaje. Corrosión severa; cuando el óxido debilita la estructura del rin de aleación.', 4, 1, '2026-02-20 15:36:44', '2026-02-25 20:37:30'),
	(16, 'Seguro de aros', 'es un sistema de seguridad antirrobo, generalmente un perno o tuerca de seguridad fabricado en acero resistente, diseñado para proteger las llantas y aros de aleación o deportivos contra robos', 4, 1, '2026-02-20 15:36:55', '2026-02-25 20:58:20'),
	(17, 'Pulido de faros', 'es un proceso de restauración que elimina la opacidad, el tono amarillento y los arañazos superficiales de las ópticas de plástico (policarbonato) de un auto, causados por la exposición al sol, lluvia y suciedad', 4, 1, '2026-02-20 15:37:06', '2026-02-25 20:57:18'),
	(18, 'Recojo y Entrega a domicilio', 'Recogemos tu vehículos en tu domicilio o centro de trabajo y cuando terminemos te entregamos en el mismo lugar', 4, 1, '2026-02-20 15:37:25', '2026-02-25 20:57:53'),
	(19, '2 Paños de pintura', 'Es el pintado de dos paños de pintura, no incluye planchado.\nSe tiene que coordinar la cita pues el tiempo de trabajo aproximado es de 3 días', 5, 1, '2026-02-20 15:38:44', '2026-02-26 20:53:17'),
	(20, 'Laminado', 'es un tipo de vidrio de seguridad compuesto por dos capas de vidrio templado unidas por una lámina intermedia de plástico (usualmente PVB - polivinil butiral)', 5, 1, '2026-02-20 15:38:50', '2026-02-25 20:56:29'),
	(21, 'Aditivo para inyectores', 'Es un pack de lo siguiente: \n*Limpiador de válvulas de inyectores + \n*Limpiador del sistema diésel + \n*Triple X\n*El tiempo de trabajo es aproximadamente 1 hr', 11, 1, '2026-02-25 20:32:05', '2026-02-26 20:44:46'),
	(22, 'Lavado exterior', 'Consiste en:\n*Pre - lavado con shampoo alcalino que elimina la contaminación adherida a la pintura. \n*Lavado con shampoo Gloss para recuperar el brillo. \n*Lavado de chasis a presión. \n*Descontaminado de línea de fender. \n*Protección de pintura con dióxido de silicio. \n*Abrillantado de llantas\n*El tiempo de trabajo es aproximadamente 1 día', 11, 1, '2026-02-25 20:42:58', '2026-02-26 20:47:54'),
	(23, 'Limpieza de motor', 'Consiste en:\n*Limpieza y descontaminado con línea de vapor. \n*Limpieza profunda con detalle APC. \n*Limpieza profunda con línea desengrasante. \n*Acondicionado de superficies plásticas en white o mate. \n*Limpieza final y descontaminado con línea alumax\n*El tiempo de trabajo es aproximadamente 4 hrs.', 11, 1, '2026-02-25 20:44:34', '2026-02-26 20:50:51'),
	(24, 'Mantenimiento Prepagado PPM', '*Congela los precios de hoy sin pagar extras en caso cueste más el año en que tu vehículo reciba el servicio. \n*Gracias a su mantenimiento con expertos tendrá mejor valor de reventa. \n*Nos acomodamos a tus necesidades, pues puedes armar tu plan desde dos mantenimientos. \nLos beneficios exclusivos son: \n*01 Revisión 1000 km \n*02 Revisiones gratis \n*01 Lavado básico \n*01 Aplicación de sanitización de los ductos de ventilación \n*01 Servicio de rectificado de discos \n*01 Paño de pintura', 11, 1, '2026-02-25 20:49:07', '2026-02-26 20:51:58'),
	(25, 'Mantenimiento Prepagado PPM N400', '5 Mantenimientos básicos y los beneficios exclusivos son: \n*01 Revisión 1000 km \n*02 Revisiones gratis \n*01 Lavado básico \n*01 Aplicación de sanitización de los ductos de ventilación \n*01 Servicio de rectificado de discos ', 11, 1, '2026-02-25 20:49:43', '2026-02-26 20:52:35'),
	(26, 'Categorízate y no pagues más', 'Envía los siguientes datos al 933 199 463: \n*Nombres y apellidos \n*Marca del vehículo \n*Número de placa \n*Número de Celular \n*Correo \n*Domicilio (opcional) \nLuego te responderemos con el descuento sin sorteos ni promociones:\n*Cliente Innovador 10%. \n*Cliente VIP 20%. \n*Cliente Experto 30%. \n*Cliente Oro 40%. \n*Cliente Élite 50%. \n*Cliente Premium 60%. \n*Cliente Wankamotors 70%', 11, 1, '2026-02-25 20:53:10', '2026-02-26 20:46:04'),
	(27, '6° Mantenimiento', '', 1, 1, '2026-02-25 21:00:48', '2026-02-25 21:00:48'),
	(28, '7° Mantenimiento', '', 1, 1, '2026-02-25 21:00:56', '2026-02-25 21:00:56'),
	(29, '8° Mantenimiento', '', 1, 1, '2026-02-25 21:01:04', '2026-02-25 21:01:04'),
	(30, '9° Mantenimiento', '', 1, 1, '2026-02-25 21:01:29', '2026-02-25 21:01:29'),
	(31, '10° Mantenimiento', '', 1, 1, '2026-02-25 21:01:37', '2026-02-25 21:01:37');

-- Volcando datos para la tabla u330129056_picaje.submotivos_citas: ~10 rows (aproximadamente)
INSERT IGNORE INTO `submotivos_citas` (`id`, `motivo_id`, `nombre`, `is_active`, `created_at`) VALUES
	(6, 3, '1er Mantenimiento', 1, '2026-02-18 02:55:36'),
	(7, 3, '2do Mantenimiento', 1, '2026-02-18 02:55:42'),
	(8, 3, '3er Mantenimiento', 1, '2026-02-26 20:56:38'),
	(9, 3, '4to Mantenimiento', 1, '2026-02-26 20:56:39'),
	(10, 3, '5to Mantenimiento', 1, '2026-02-26 20:57:04'),
	(11, 3, '6to Mantenimiento', 1, '2026-02-26 20:57:12'),
	(12, 3, '7mo Mantenimiento', 1, '2026-02-26 20:57:20'),
	(13, 3, '8vo Mantenimiento', 1, '2026-02-26 20:57:27'),
	(14, 3, '9no Mantenimiento', 1, '2026-02-26 20:57:42'),
	(15, 3, '10mo Mantenimiento', 1, '2026-02-26 20:57:50');

-- Volcando datos para la tabla u330129056_picaje.support_tickets: ~0 rows (aproximadamente)

-- Volcando datos para la tabla u330129056_picaje.talleres: ~4 rows (aproximadamente)
INSERT IGNORE INTO `talleres` (`id`, `centro_id`, `nombre`, `created_at`) VALUES
	(1, 1, 'Taller la ribera', '2026-01-27 04:32:34'),
	(2, 1, 'Taller centro', '2026-01-27 04:32:54'),
	(3, 1, 'taller la ciudad', '2026-01-28 01:08:35'),
	(5, 3, 'taller chiclayo', '2026-02-16 02:11:50');

-- Volcando datos para la tabla u330129056_picaje.tipo_inventario: ~3 rows (aproximadamente)
INSERT IGNORE INTO `tipo_inventario` (`id`, `nombre`, `created_at`, `updated_at`) VALUES
	(1, 'Aceites', '2026-02-20 02:51:49', '2026-02-25 19:46:22'),
	(2, 'Fluidos', '2026-02-26 20:59:40', '2026-02-26 20:59:40'),
	(3, 'Repuestos', '2026-02-26 20:59:47', '2026-02-26 20:59:47');

-- Volcando datos para la tabla u330129056_picaje.tiposactividades: ~6 rows (aproximadamente)
INSERT IGNORE INTO `tiposactividades` (`id`, `name`, `tipo`, `is_active`, `created_at`) VALUES
	(1, 'Revisión', 1, 1, '2026-02-08 16:59:52'),
	(2, 'Mantenimiento Preventivo', 2, 1, '2026-02-12 17:46:22'),
	(3, 'Mantenimiento Correctivo', 2, 1, '2026-02-14 14:35:27'),
	(4, 'Campañas', 2, 1, '2026-02-14 14:35:39'),
	(5, 'Diagnóstico', 2, 1, '2026-02-14 14:35:58'),
	(6, 'Campaña', 1, 1, '2026-02-14 14:36:23');

-- Volcando datos para la tabla u330129056_picaje.user_absences: ~1 rows (aproximadamente)
INSERT IGNORE INTO `user_absences` (`id`, `user_id`, `start_date`, `end_date`, `date`, `start_time`, `end_time`, `reason`, `notes`, `will_be_absent`, `created_at`) VALUES
	(1, 1, '2026-02-16', '2026-02-16', '0000-00-00', '09:30:00', '10:00:00', 'falta', 'falta', 1, '2026-02-18 01:22:45');

-- Volcando datos para la tabla u330129056_picaje.usuarios: ~2 rows (aproximadamente)
INSERT IGNORE INTO `usuarios` (`id`, `fullname`, `username`, `email`, `phone`, `password_hash`, `role`, `is_active`, `permissions`, `work_schedule`, `created_at`, `color`) VALUES
	(1, 'Super Administrador', 'admin', NULL, NULL, '$2b$10$hU4vvSLN1yd4ufq4SzDyw.L1X5ZabO5/Sahs5fS6JbtkM3g1p3t62', 'Administrador General', 1, '{"home":{"edit":false,"view":true,"create":false,"delete":false,"viewall":false},"citas":{"edit":true,"view":true,"create":true,"delete":false,"viewall":true},"etapas":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"marcas":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"picaje":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"modelos":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"ordenes":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"clientes":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"reportes":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"usuarios":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"cotizacion":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"inventario":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"configuracion":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"tiposactividades":{"edit":true,"view":true,"create":true,"delete":true,"viewall":false},"mantenimiento":{"edit":true,"delete":true,"create":true,"view":true},"combomantenimiento":{"view":true,"create":true,"edit":true,"delete":true},"precios":{"view":true,"create":true,"edit":true,"delete":true},"carrosparamantenimiento":{"delete":true,"edit":true,"create":true,"view":true},"mensajes":{"delete":true,"edit":true,"create":true,"view":true},"recepcion":{"view":true,"create":true,"edit":true,"delete":true}}', '{"fri":{"start":"08:00","end":"18:00"},"mon":{"end":"10:00","start":"08:00"},"sat":{"start":"08:00","end":"18:00"},"sun":null,"thu":{"start":"08:00","end":"18:00"},"tue":{"start":"10:00","end":"18:00"},"wed":{"start":"08:00","end":"18:00"}}', '2026-01-22 16:15:58', '#5e17eb'),
	(3, 'timothy', 'timothy', NULL, NULL, '$2b$10$lyb97/XYhaY0vcvoJmidd.nUJbQRQdf996FyIzI2D8GGY/BQGT32q', 'admin', 1, '{}', '{}', '2026-02-18 20:26:24', '#4ed47b');

-- Volcando datos para la tabla u330129056_picaje.vehiculos: ~5 rows (aproximadamente)
INSERT IGNORE INTO `vehiculos` (`id`, `cliente_id`, `placas`, `vin`, `marca_id`, `modelo_id`, `anio`, `color`, `kilometraje`, `fecha_ultima_visita`, `created_at`, `deleted_at`) VALUES
	(1, 1, 'VTT-456', 'S97G8S3', 7, 4, 2023, 'AZUL', 1200, NULL, '2026-02-13', '2026-02-14 03:01:21'),
	(2, 2, 'bim-123', '1HGCM82633A123456', 7, 3, 2010, 'BLANCO', 12000, '2026-02-27', '2026-02-13', '2026-02-14 02:52:43'),
	(6, 3, 'BIM-123', '1HGBH41JZYU209486', 3, 2, 2000, 'rojo', NULL, NULL, '2026-02-18', NULL),
	(7, 3, 'ZXY-678', '1HGBH41JZYU789875', 15, 6, 2011, 'Azul', 10000, NULL, '2026-02-19', NULL),
	(8, 5, 'CLF450', NULL, 14, 21, 2015, 'blanco', 199, '2026-01-05', '2026-02-20', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
