import LessonDto from './dtos/LessonDto';
import IMapper from './Mapper';

export default class LessonMap extends IMapper {
	static toDTO(dataLesson) {
		if (!dataLesson) {
			throw new Error('DataLesson is empty');
		}
		let dto = new LessonDto();
		dto.id = dataLesson.id;
		dto.name = dataLesson.name;		
		dto.author = dataLesson.author;
		dto.originId = dataLesson.originid;
		dto.studentId = dataLesson.userid;
		dto.instructorId = dataLesson.instructorid;
		dto.versionId = dataLesson.versionId;
		dto.version = dataLesson.version;
		dto.versionName = dataLesson.versionName;
		return dto;
	}
}
